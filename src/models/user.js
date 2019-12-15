const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Post = require('./post');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value))
            {
                throw new Error('email is invalid');
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0)
            {
                throw new Error('Age must be positive number');
            }
        }        
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if(value.toLowerCase().includes("password"))
            {
                throw new Error("password cannot contain 'password'")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }],
    avatar: {
        type: Buffer    //store buffer with binary image data
    }
}, {
    timestamps: true    //timestamps adds 2 extra properties on the object: createdAt and updatedAt
});

//virtual property is not actual data, its a relationship between 2 entities (user and post)
//the posts property in User is Virtual, it does not actually exist
userSchema.virtual('posts', {  
    //local field is relationship between that and the post.owner field
    ref: 'Post',
    localField: '_id', // where local data is stored
    foreignField: 'owner',  //name of field on other entity 
});

//methods are accessible on the individual instance
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SIGNATURE);

    user.tokens = user.tokens.concat({ token: token });
    await user.save();

    return token;

}

//toJSON runs automatically when JSON is stringified
//for example, toJSON will run automatically before res.send(user) is called in the rout handlers
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

//statics are accessible on model (think public static function())
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email}) //alternatively, ...findOne({email: email, password: password})

    if (!user)
    {
        throw new Error('unable to login');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch)
    {
        throw new Error('unable to login');
    }

    return user;
}

//pre() function runs before event
//in this case, pre() runs before save
//NOTE** use standard function() instead of () => {}, since =>{} does NOT bind 'this'
userSchema.pre('save', async function(next) {
    //in this case, 'this' is the document being saved
    const user = this;

    //check if password was changed in update document, only hash password if password was just created or modified
    //isModified returns true when password was first created or modified, dont want to hash the same password more than once
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next(); //use next() otherwise function hangs!

});

//Delete all user posts when user is removed
userSchema.pre('remove', async function(next) {
    const user = this;
    await Post.deleteMany({ owner: user._id });

    next();
})

const User = mongoose.model('User', userSchema);

//Example on how to create user from User model
// const me = new User({
//     name: "Crystal  ",
//     email:"  another@gmail.com ",
//     age:30,
//     password: "  random111"
// });

// me.save().then((me) => {
//     console.log(me);
// }).catch((error) => {
//     console.log("error", error);
// });

module.exports = User;