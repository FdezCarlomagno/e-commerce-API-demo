const db = require('../db');

function getQuery(page, limit, filter, order, asc) {
    const offset = (page - 1) * limit; // Calcula el OFFSET
    let query = "SELECT * FROM products";

    if (order) {
        switch (order) {
            case 'price':
                query += " ORDER BY price";
                break;
            case 'stock':
                query += " ORDER BY stock";
                break;
        }
    }
    //I DONT KNOW WHY IT DOESNT WORK WITH THIS: query += asc ? " ASC" : " DESC";
    if (asc) {
        if (asc === 'true') {
            query += " ASC";
        } else {
            query += " DESC";
        }
    }

    let paginationQuery = " LIMIT ? OFFSET ?"
    query += paginationQuery;

    return {
        offset: offset,
        query: query
    }
}

class ProductModel {
    async getProducts(page, limit, filter, order, asc) {
        const { offset, query } = getQuery(page, limit, filter, order, asc)
        const [products] = await db.execute(query, [limit, offset]); // Usa parámetros para evitar inyección SQL
        return products;
    }

    async getProductByID(id) {
        const [product] = await db.execute("SELECT * FROM products WHERE product_id = ?", [id]);
        return product;
    }
    async getProductByName(name) {
        const [product] = await db.execute("SELECT * FROM products WHERE name = ?", [name]);
        return product;
    }
    async deleteProduct(id) {
        const [result] = await db.execute("DELETE FROM products WHERE product_id = ?", [id]);
        return result.affectedRows;
    }
    async addProduct(name, description, price, stock) {
        const [result] = await db.execute("INSERT INTO products(name, description, price, stock, created_at) VALUES(?,?,?,?, NOW())", [name, description, price, stock]);

        return result.insertId;
    }
    async updateProduct(id, name, description, price, stock) {
        const [result] = await db.execute("UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE product_id = ?", [name, description, price, stock, id]);

        return result.affectedRows;
    }
}

module.exports = new ProductModel()