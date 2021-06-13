const request = require('supertest');
const app = require('../index');
const randomstring = require("randomstring");

describe('Authentication Service Tests', () => {
    const user = randomstring.generate(6);
    let token;
    test('Register User Successfully', async () => {
        const res = await request(app)
            .post('/api/user/register')
            .set('Content-Type', 'application/json')
            .send({
                'name': user,
                'email': user + '@email.com',
                'password': 'customer123'
            });
        expect(res.statusCode).toEqual(201);
    });

    test('Login Successfully', async () => {
        const res = await request(app)
            .post('/api/user/login')
            .set('Content-Type', 'application/json')
            .send({
                'email': user + '@email.com',
                'password': 'customer123'
            });
        token = res.body.token;
        expect(res.statusCode).toEqual(200);
    });

    test('Logout Successfully', async () => {
        const res = await request(app)
            .post('/api/user/logout')
            .set('Content-Type', 'application/json')
            .set('authorization', 'bearer' + token)
            .send();
        expect(res.statusCode).toEqual(200);
    });

    test('Login User Unsuccessfully', async () => {
        const res = await request(app)
            .post('/api/user/login')
            .set('Content-Type', 'application/json')
            .send({
                'email': user + '@email.com',
                'password': 'Wrong Password'
            });
        expect(res.statusCode).toEqual(401);
    });
});