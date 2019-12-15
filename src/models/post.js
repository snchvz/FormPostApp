const mongoose = require('mongoose');

//we use mongoose.schema and explicitly create a schema to be able to customize schema options like timestamps
const postSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,   //mongoose objectID type
        required: true,
        ref: 'User'     //ref creates a reference from this field (owner) to another model (User)
    }       
}, {
    timestamps: true
})

const Post = mongoose.model("Post", postSchema);

//Example for creating and saving post
// const post = new Post({
//     description: "laundry"
// });

// post.save().then((result) => {
//     console.log(result);
// }).catch((error) => {
//     console.log(error);
// })

module.exports = Post;