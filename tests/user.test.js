const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const {UserOneID, UserOne,setUpDatabase} = require('./fixtures/db');

//beforeAll() -> before ALL tests, run function once

//before each individual test, run function every time
beforeEach(setUpDatabase);

test('should signup new user', async () => {
    const response = await request(app).post('/users').set('Content-Type', 'application/json')
    .send({
        name: 'samp',
        email: 'dfgdf@example.com',
        password: 'vmier9003tfd!'
    }).expect(201);

    // assert that the database was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();    //expect user to NOT be null

    //assertions about the response
    //toMatchObject checks that all the properties that are specified are contained (extra properties are ok)
    expect(response.body).toMatchObject({
        user: {
            name:'samp',
            email:'dfgdf@example.com'
        },
        token: user.tokens[0].token
    }); //the assertion expects name, email and token to match

    expect(user.password).not.toBe('vmier9003tfd!');
});

test('should log in existing user', async() => {
    const response = await request(app).post('/users/login').set('Content-Type', 'application/json').send({
        email: UserOne.email,
        password: UserOne.password
    }).expect(200);

    const user = await User.findById(response.body.user._id);
    //expect the first token from new user (UserOne) equals second token from login
    expect(response.body.token).toBe(user.tokens[1].token);

});

test('should NOT log in', async () => {
    await request(app).post('/users/login').set('Content-Type', 'application/json').send({
        email: "failingemail@gmail.com",
        password: UserOne.password
    }).expect(400);
});

test('should get profile for user', async() => {
    await request(app).get('/users/me').set('Authorization', `Bearer ${UserOne.tokens[0].token}`).send().expect(200);
});

test('should not get profile for unauthenticated user', async() => {
    await request(app).get('/users/me').send().expect(401);
});

test('should delete account for user (authenticated)', async() => {
    await request(app).delete('/users/me').set('Authorization', `Bearer ${UserOne.tokens[0].token}`).send().expect(200);
    const user = await User.findById(UserOneID);

    //assert that UserOne was deleted by getting back a null when trying to search for the user
    expect(user).toBeNull();

});

test('should NOT delete account for user (NOT authenticated', async () => {
    await request(app).delete('/users/me').send().expect(401);
});

test('should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${UserOne.tokens[0].token}`)
        .attach('avatar','tests/fixtures/profile-pic.jpg')
        .expect(200);
    const user = await User.findById(UserOneID);
    // expect({}).toBe({}); this FAILS bc .toBe() uses === 
    expect(user.avatar).toEqual(expect.any(Buffer));    //check if user.avatar is of type Buffer
});

test('should update valid user field', async() => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${UserOne.tokens[0].token}`)
        .send({
            name:'michelle'
        })
        .expect(200);
    const user = await User.findById(UserOneID);
    expect(user.name).toBe('michelle');    
});

test('should not update invalid user fields', async() => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${UserOne.tokens[0].token}`)
        .send({
            location:'USA'
        })
        .expect(400);

})