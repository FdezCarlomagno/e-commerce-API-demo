const userModel = require('../models/user.model');
const productModel = require('../models/product.model');
const cartModel = require('../models/cart.model');

class CartController {
    async addToCart(req, res) {
        try {
            const user_id = req.user.sub;

            const { product_id, quantity } = req.body;

            if (!product_id || !quantity || quantity <= 0) {
                return res.status(400).json({ error: "Invalid product ID or quantity" });
            }

            const result = await productModel.getProductByID(product_id);
            const product = result[0];

            if (!product) {
                return res.status(404).json({ error: `Product with id ${product_id} not found` })
            }

            if (product.stock < quantity) {
                return res.status(400).json({ msg: "Insufficient stock available" });
            }

            const user = await userModel.getUserByID(user_id);

            if (!user) {
                return res.status(404).json({ error: `User with id ${user_id} not found` })
            }

            let cart = await cartModel.getCartByUserID(user_id);

            if (!cart) {
                const cart_id = await cartModel.createCart(user_id);
                cart = { cart_id: cart_id };
            }

            const cartItem = await cartModel.getCartItem(cart.cart_id, product_id);

            if (cartItem && (cartItem.quantity + quantity > product.stock)) {
                return res.status(400).json({ msg: 'Insufficient stock' })
            }

            if (cartItem) {
                await cartModel.updateCartItemQuantity(cart.cart_id, product_id, cartItem.quantity + quantity);
            } else {
                await cartModel.addCartItem(cart.cart_id, product_id, quantity);
            }

            return res.json({ msg: "Product added to the cart succesfully" });

        } catch (error) {
            return res.status(500).json({ msg: error });
        }
    }

    async getUserCart(req, res) {
        try {
            const cart = await cartModel.getCartByUserID(req.user.sub);

            if (!cart) {
                return res.status(200).json({ msg: 'The user does not have an active cart' });
            }

            return res.json(cart);
        } catch (error) {
            return res.status(500).json({ error: error });
        }
    }

    async getCartProducts(req, res) {
        try {
            const user = await userModel.getUserByID(req.user.sub);

            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            const cart = await cartModel.getCartByUserID(user.id);

            if (!cart) {
                return res.json({ msg: 'The user doesnt have an active cart' });
            }

            const products = await cartModel.getItemsByUserID(user.id);

            if (!products || products.length == 0) {
                return res.json({ msg: "The user doesnt have any products" });
            }

            return res.json(products);
        } catch (error) {
            return res.status(500).json({ error: error })
        }
    }

    async updateCartItemQuantity(req, res) {
        try {
            const user = await userModel.getUserByID(req.user.sub);
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            const cart = await cartModel.getCartByUserID(user.id);
            if (!cart) {
                return res.status(404).json({ msg: 'The user doesn\'t have an active cart' });
            }

            const { product_id, quantity } = req.body;

            if (!product_id || typeof product_id !== 'number' || product_id <= 0) {
                return res.status(400).json({ msg: 'Invalid product ID' });
            }

            if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
                return res.status(400).json({ msg: 'Invalid quantity' });
            }

            const result = await productModel.getProductByID(product_id);
            const product = result[0];

            if (!product) {
                return res.status(404).json({ msg: `Product with id: ${product_id} not found` });
            }

            const cartItem = await cartModel.getCartItem(cart.cart_id, product_id);
            if (!cartItem) {
                return res.status(400).json({ msg: 'The product is not in the cart' });
            }

            if (quantity > product.stock) {
                return res.status(400).json({ msg: `Quantity exceeds stock. Available stock: ${product.stock}` });
            }

            const affectedRows = await cartModel.updateCartItemQuantity(cart.cart_id, product_id, quantity);
            return res.json({ msg: 'The quantity has been updated successfully', affectedRows: affectedRows });
        } catch (error) {
            console.error("Error in updateCartItemQuantity:", error);
            return res.status(500).json({ msg: 'An unexpected error occurred' });
        }
    }

    async deleteCartItem(req, res) {
        try {
            const user = await userModel.getUserByID(req.user.sub);
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            const cart = await cartModel.getCartByUserID(user.id);
            if (!cart) {
                return res.status(404).json({ msg: 'The user doesn\'t have an active cart' });
            }

            const { product_id } = req.body;

            if (!product_id || typeof product_id !== 'number' || product_id <= 0) {
                return res.status(400).json({ msg: 'Invalid product ID' });
            }

            const cartItem = await cartModel.getCartItem(cart.cart_id, product_id);
            if (!cartItem) {
                return res.status(404).json({ msg: 'The product is not in the cart' });
            }

            const affectedRows = await cartModel.deleteItemFromCart(cart.cart_id, product_id);
            return res.json({ msg: 'The product has been deleted from the cart', affectedRows: affectedRows });
        } catch (error) {
            console.error("Error in deleteCartItem:", error);
            return res.status(500).json({ msg: 'An unexpected error occurred' });
        }
    }


}

module.exports = new CartController();