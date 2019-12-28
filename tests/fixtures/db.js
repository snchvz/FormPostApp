const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user');
const Post = require('../../src/models/post');

const UserOneID = new mongoose.Types.ObjectId();
const UserOne = {
    _id: UserOneID,
    name: 'mike',
    email: 'mike@example.com',
    password: 'asecretpas233',
    tokens: [{
        token: jwt.sign({_id: UserOneID}, process.env.JWT_SIGNATURE)
    }]
};

const UserTwoID = new mongoose.Types.ObjectId();
const UserTwo = {
    _id: UserTwoID,
    name: 'Jane',
    email: 'Jane@example.com',
    password: 'dfgdf44rfs0',
    tokens: [{
        token: jwt.sign({_id: UserTwoID}, process.env.JWT_SIGNATURE)
    }]
};

const postOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'first post 1',
    completed: false,
    owner: UserOneID
}
const postTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'second post 2',
    completed: true,
    owner: UserOneID
}

const postThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'third post 3',
    completed: false,
    owner: UserTwoID
}

const setUpDatabase = async() => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await new User(UserOne).save();
    await new User(UserTwo).save();
    await new Post(postOne).save();
    await new Post(postTwo).save();
    await new Post(postThree).save();
}

module.exports = {
    UserOneID,
    UserOne,
    UserTwoID,
    UserTwo,
    postOne,
    postTwo,
    postThree,
    setUpDatabase
}