const app = require('../index');
const request = require('supertest');

const getToken = async (nickname, password) => {
    const response = await request(app).post('/api/users/token').auth(nickname, password);
    return response.body.token;
}

const getUserByName = async (name) => {
    //we have to be logged in as admin
    const token  = await getToken('User1', 'password1');
    const response = await request(app).get(`/api/users?name=${name}`).set('Authorization', `Bearer ${token}`);
    return response.body; //return response.body[0] ?????
}


describe('Users API', () => {
    it('should return a token', async () => {
        const token = await getToken('User1', 'password1');
        expect(token).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_+/=]*$/) //regex for JWT
    })
    it('should be the admin logged in', async () => {              //INICIO DE SESION CON BASIC
        const token = await getToken('User1', 'password1');
                                                                    //SETEAMOS EL TIPO DE AUTH: BEARER con TOKEN
        const response = await request(app).get('/api/users/profile').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
 
        expect(response.body).toHaveProperty('isAdmin', 1)
    })
    it('should return unauthorized', async () => {
        const wrongTokenTest = 'thisIsATestTokenThatDoesn´t work';
        const response = await request(app).get('/api/users').set('Authorization', `Bearer ${wrongTokenTest}`);
        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            "error": "Invalid token"
        })
    })

    it('should register a user and get the profile', async () => {
        const response = await request(app).post('/api/users/register').send({
            nickname: "testUser",
            email: "testUser@gmail.com",
            password: "passwordTest"
        })

        expect(response.status).toBe(201); //created

        const token = await getToken('testUser', 'passwordTest');
        const profileResponse = await request(app).get('/api/users/profile').set('Authorization', `Bearer ${token}`)
        expect(profileResponse.status).toBe(200);

    })

    //This doesn´t work but I tested it manually using thunderclient and it works perfectly
    it('should make the testUser admin', async () => {
        //first we log in as an admin
        const token = await getToken('User1', 'password1');

        const adminResponse = await request(app).get('/api/users/profile').set('Authorization', `Bearer ${token}`);
        expect(adminResponse.status).toBe(200);

        expect(adminResponse.body).toHaveProperty('isAdmin', 1);

        let testUser = await getUserByName('testUser');
        //Not admin yet
        console.log("Before promotion, testUser.isAdmin:", testUser.isAdmin);
        expect(testUser.isAdmin).toBe(0);

        const response = await request(app).put(`/api/users/promote/${testUser.id}`).set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        //message: "User successfully promoted to admin."
        expect(response.body).toHaveProperty('message', "User successfully promoted to admin.");
        //Promoted to admin

        testUser = await getUserByName('testUser');
        console.log("after promotion, testUser.isAdmin:", testUser.isAdmin);
        expect(testUser.isAdmin).toBe(1);
    })

    it('should update the profile of the user', async () => {
        const token = await getToken('testUser', 'passwordTest');
        const response = await request(app).put('/api/users/profile').set('Authorization', `Bearer ${token}`)
        .send({
            nickname: 'testUserPut',
            email: 'testUserPut@gmail.com'
        })
        console.log(response.body)
        let user = await getUserByName('testUserPut');
        expect(response.status).toBe(200);
        expect(user.nickname).toBe('testUserPut');
    })

    it('should delete the user', async () => {
        const token = await getToken('testUserPut', 'passwordTest');
        const response = await request(app).delete('/api/users/profile').set('Authorization', `Bearer ${token}`)

        expect(response.status).toBe(200);


        expect(response.body).toEqual({
            msg: "Account deleted succesfully",
            rowsAffected: 1
        })
    })
})

module.exports = getToken;