const db = require('../db');

class CartModel {
    async getCartByUserID(user_id){
        const [rows] = await db.execute("SELECT * FROM cart WHERE user_id = ?", [user_id]);
        return rows.length > 0 ? rows[0] : null;
    }

    async createCart(user_id){
        const [result] = await db.execute("INSERT INTO cart(user_id) VALUES(?)", [user_id]);
        return result.insertId;
    }

    async getItemsByUserID(user_id) {
        const query = `
            SELECT 
                p.*,               -- Selecciona todos los campos del producto
                ci.quantity        -- Añade la cantidad del producto en el carrito
            FROM 
                cart_item ci
            INNER JOIN 
                cart c ON ci.cart_id = c.cart_id   -- Une con la tabla cart para vincular usuario
            INNER JOIN 
                products p ON ci.product_id = p.product_id  -- Une con la tabla product para obtener detalles del producto
            WHERE 
                c.user_id = ?      -- Filtra por el ID del usuario
        `;
        const [result] = await db.execute(query, [user_id]);
    
        return result; // Retorna la lista de productos con detalles y cantidad
    }
    
    
    async getCartItem(cart_id, product_id) {
        const query = "SELECT * FROM cart_item WHERE cart_id = ? AND product_id = ?";
        const [rows] = await db.execute(query, [cart_id, product_id]);
        return rows.length > 0 ? rows[0] : null;
    }
    
    async addCartItem(cart_id, product_id, quantity){
        const query = "INSERT INTO cart_item(cart_id, product_id, quantity) VALUES (?,?,?)";
        const [result] = await db.execute(query, [cart_id, product_id, quantity]);

        return result.insertId;
    }
    async updateCartItemQuantity(cart_id, product_id, quantity){
        const query = "UPDATE cart_item SET quantity = ? WHERE cart_id = ? AND product_id = ?";
        const [result] = await db.execute(query, [quantity, cart_id, product_id]);

        return result.affectedRows;
    }

    async deleteItemFromCart(cart_id, product_id){
        const query = "DELETE FROM cart_item WHERE cart_id = ? AND product_id = ?";
        const result = await db.execute(query, [cart_id, product_id]);

        return result.affectedRows;
    }
}

module.exports = new CartModel();