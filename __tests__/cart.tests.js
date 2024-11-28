const request = require('supertest');
const app = require('../index');
const getToken = require('./users.tests');

let token;

beforeAll(async () => {
    const response = await request(app).post('/api/users/register').send({
        nickname: "testUserCart",
        email: "testUser@gmail.com",
        password: "passwordTest"
    })

    expect(response.status).toBe(201);

    token = await getToken('testUserCart', 'passwordTest');

    expect(token).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_+/=]*$/) //regex for JWT
})

describe('Carts relationships with Users and Products', () => {
    it('should return a non existing cart', async () => {
        const token = await getToken('testUserCart', 'passwordTest');
        const response = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.msg).toBe('The user does not have an active cart');
    })

    it('should add a product to the cart', async () => {
        const token = await getToken('testUserCart', 'passwordTest');
        const response = await request(app).post('/api/cart/addToCart').set('Authorization', `Bearer ${token}`).send({
            product_id: 5,
            quantity: 5
        })

        expect(response.status).toBe(200);
        expect(response.body.msg).toBe("Product added to the cart succesfully");
    })

    it('should not let the user add a product to the cart because of insufficient stock', async () => {
        const token = await getToken('testUserCart', 'passwordTest');
        const response = await request(app).post('/api/cart/addToCart').set('Authorization', `Bearer ${token}`).send({
            product_id: 5,
            quantity: 100
        })

        expect(response.status).toBe(400);
        expect(response.body.msg).toBe('Insufficient stock available');
    })

    it('should modify the quantity of the product already added', async () => {
        const token = await getToken('testUserCart', 'passwordTest');
        const response = await request(app).put('/api/cart/addToCart').set('Authorization', `Bearer ${token}`).send({
            product_id: 5,
            quantity: 10
        })

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ msg: 'The quantity has been updated successfully', affectedRows: 1 })
    })

    it('shouldn´t let the user modify the quantity of a product that is not in his cart', async () => {
        const token = await getToken('testUserCart', 'passwordTest');
        const response = await request(app).put('/api/cart/addToCart').set('Authorization', `Bearer ${token}`).send({
            product_id: 9,
            quantity: 10
        })

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ msg: 'The product is not in the cart' })
    })

    it('should retrieve the products of the users cart', async () => {
        const token = await getToken('testUserCart', 'passwordTest');
        const response = await request(app).get('/api/cart/products').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body[0]).toHaveProperty('name', 'Papel higienico');
    })

    it('should not find the product in the cart', async () => {
        const token = await getToken('testUserCart', 'passwordTest');
        const response = await request(app).delete('/api/cart/products').set('Authorization', `Bearer ${token}`)
        .send({
            product_id: 13
        })

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ msg: 'The product is not in the cart' })
    })

    it('should delete the product from the users cart', async () => {
        const token = await getToken('testUserCart', 'passwordTest');
        const response = await request(app).delete('/api/cart/products').set('Authorization', `Bearer ${token}`)
        .send({
            product_id: 5
        })

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('msg', 'The product has been deleted from the cart');
    })

    it('should´nt find any products in the cart', async () => {
        const token = await getToken('testUserCart', 'passwordTest');
        const response = await request(app).get('/api/cart/products').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ msg:"The user doesnt have any products"});
    })

    afterAll(async () => {
        //delete the testUser
        const token = await getToken('testUserCart', 'passwordTest');
        const response = await request(app).delete('/api/users/profile').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            msg: "Account deleted succesfully",
            rowsAffected: 1
        })
    })
})