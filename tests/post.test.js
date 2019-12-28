const request = require('supertest');
const Post = require('../src/models/post');
const app = require('../src/app');
const {UserOneID, UserTwoId, UserTwo, UserOne, postOne, setUpDatabase} = require('./fixtures/db');

//beforeAll() -> before ALL tests, run function once

//before each individual test, run function every time
beforeEach(setUpDatabase);

test('should create post for user', async() => {
    const response = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${UserOne.tokens[0].token}`)
        .send({
            description: 'test post'
        })
        .expect(201);
    const post = await Post.findById(response.body._id);
    expect(post).not.toBeNull();

    expect(post.completed).toEqual(false);
});

test('should return all user posts', async() => {
    const response = await request(app)
        .get('/posts')
        .set('Authorization', `Bearer ${UserOne.tokens[0].token}`)
        .send()
        .expect(200);

    expect(response.body.length).toBe(2);
});

test('should NOT delete a post if not the owner of post (unauthorized)', async() => {
    const response = await request(app)
        .delete(`/posts/${postOne._id}`)
        .set('Authorization', `Bearer ${UserTwo.tokens[0].token}`)
        .send()
        .expect(404);

    const p = Post.findById(postOne._id);
    expect(p).not.toBeNull();
})