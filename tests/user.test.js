const request = require('supertest');
const app = require('../src/app');

test('should signup new user', async () => {
    await request(app).post('/users').set('Content-Type', 'application/json')
    .send({
        name: 'samp',
        email: 'samp@example.com',
        password: 'vmier9003tfd!'
    }).expect(201)

})