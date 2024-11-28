const request = require('supertest');
const app = require('../index');
const getToken = require('./users.tests');

const getTestProductId = async (name) => {
    const response = await request(app).get(`/api/products?name=${name}`);
    expect(response.status).toBe(200); // Ensure the request succeeded
    const product = response.body[0];
    return product.product_id;
};

let adminToken;
//Log the admin
beforeEach(async () => {
    adminToken = await getToken('User1', 'password1');
    expect(adminToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_+/=]*$/) //regex for JWT
})

describe('Products API', () => {
    it('should return the 5 first products', async () => {
        const response = await request(app).get('/api/products');
        expect(response.status).toBe(200);
        expect(response.body[0]).toHaveProperty('name', 'Papel higienico')
    })
    it('should return lapicero', async () => {
        const response = await request(app).get('/api/products?page=2&limit=2');
        expect(response.status).toBe(200);
        expect(response.body[0]).toHaveProperty('name', 'Lapicero')
    })

    it('should return product with most stock', async () => {
        const response = await request(app).get('/api/products?orderBy=stock&asc=false');
        expect(response.status).toBe(200);
        expect(response.body[0]).toHaveProperty('stock', 300);
    })

    //POST, PUT Y DELETE OF A NEW PRODUCT AS ADMIN 
    it('should add a new product', async () => {
        //Add product
        const response = await request(app).post('/api/products').set('Authorization', `Bearer ${adminToken}`)
        .send({
            name: 'Test Product',
            description: 'Description test product',
            price: '100',
            stock: 10
        })

        expect(response.status).toBe(201); //Product created
        expect(response.body[0]).toHaveProperty('name', 'Test Product');
    })

    it('should get and modify existing product', async () => {
        const testId = await getTestProductId('Test Product');

        const putResponse = await request(app).put(`/api/products/${testId}`).set('Authorization', `Bearer ${adminToken}`).send({
            name: 'Test Product put',
            description: 'Description test product put',
            price: '100',
            stock: 10
        })

        expect(putResponse.status).toBe(200);
        //{"affectedRows": 1, "msg": "Product updated succesfully"}
        expect(putResponse.body).toHaveProperty('msg', "Product updated succesfully");
    })

    it('should delete the test product', async () => {
        const testId = await getTestProductId('Test Product put');

        const response = await request(app).delete(`/api/products/${testId}`).set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('msg','Product deleted succesfully')
    })

    it('should return 404', async () => {
        const response = await request(app).get('/api/product');
        expect(response.status).toBe(404);
    })
})