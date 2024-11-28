const productModel = require('../models/product.model');
const userModel = require('../models/user.model');
require('dotenv').config();

function getParams(req, res){
    let { filter, orderBy, page, limit, asc } = req.query;

    if(!page || page <= 0){
        page = 1;
    }
    
    return {
        filter: filter,
        order: orderBy,
        page:page,
        limit: limit || 5,
        asc: asc
    }
}



class ProductController {

    constructor() {
        this.getProducts = this.getProducts.bind(this); // Asegura el contexto
        this.getProductByName = this.getProductByName.bind(this);
    }
    
    async getProducts(req, res) {
        try {
            const params = getParams(req, res);
    
            if (req.query.name) {
                
                const product = await this.getProductByName(req.query.name); // Llama correctamente porque esta bindeada
                if (!product) {
                    return res.status(404).json({ msg: 'Product not found' });
                }
                return res.json(product);
            }
    
            const products = await productModel.getProducts(
                params.page,
                params.limit,
                params.filter,
                params.order,
                params.asc
            );
    
            if (!products) {
                return res.json({ msg: "no products available " });
            }
    
            return res.json(products);
        } catch (error) {
            return res.status(500).json({ msg: "could not get products", error: error });
        }
    }
    
    async getProductByName(name) {
        const product = await productModel.getProductByName(name);
        return product || null;
    }
    

    async getProductByID(req, res) {
        try {
            const product_id = req.params.product_id;

            const [product] = await productModel.getProductByID(product_id);

            if (!product) {
                return res.status(404).json({ msg: `the product with id: ${product_id} not found` });
            }

            return res.json({ product: product, id: product_id });
        } catch (error) {
            return res.status(500).json({ msg: "could not get product by ID", error: error });
        }
    }
    async addProduct(req, res) {
        if (!userModel.isAdmin(req.user.sub)) {
            return res.status(401).json({ msg: 'user not authorized' });
        }

        try {
            const { name, description, price, stock } = req.body;

            if (!name || !description || !price || !stock) {
                return res.status(400).json({ msg: "Missing mandatory fields" });
            }

            if (price <= 0 || stock < 0) {
                return res.status(400).json({ msg: "Prices and stock values must be positive integers" });
            }

            const newProduct_id = await productModel.addProduct(name, description, price, stock);

            const newProduct = await productModel.getProductByID(newProduct_id);

            return res.status(201).json(newProduct);
        } catch (error) {
            return res.status(500).json({ msg: "Error adding product", error: error });
        }
    }
    async deleteProduct(req, res) {
        if (!userModel.isAdmin(req.user.sub)) {
            return res.status(401).json({ msg: 'user not authorized' });
        }

        try {
            const id = req.params.product_id;

            const product = await productModel.getProductByID(id);

            if (!product) {
                return res.status(404).json({ msg: `Product with id: ${id} not found` });
            }

            const affectedRows = await productModel.deleteProduct(id);

            return res.json({ msg: 'Product deleted succesfully', rowsAffected: affectedRows });
        } catch (error) {
            return res.status(500).json({ msg: 'Could not delete product', error: error });
        }
    }
    async updateProduct(req, res) {
        try {
            const { name, description, price, stock } = req.body;
            const id = req.params.product_id;

            const product = await productModel.getProductByID(id);
            
            if (!product) {
                return res.status(404).json({ msg: `Product with id: ${id} not found` });
            }

            if (!name || !description || !price || !stock) {
                return res.status(400).json({ msg: "Missing mandatory fields" });
            }

            if (price <= 0 || stock < 0) {
                return res.status(400).json({ msg: "Prices and stock values must be positive integers" });
            }

            const affectedRows = await productModel.updateProduct(id, name, description, price, stock);

            return res.json({msg: 'Product updated succesfully', affectedRows: affectedRows});
        } catch (error) {
            return res.status(500).json({ error: error });
        }
    }
}

module.exports = new ProductController();