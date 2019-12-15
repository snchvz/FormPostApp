const express = require('express');
const Post = require('../models/post');
const router = new express.Router();
const auth = require('../middleware/auth');

//Create new Post
router.post('/posts', auth, async (req,res) => {
    //const post = new Post(req.body);
    const post = new Post({
        ...req.body,    // ES6 ...req.body copies all properties of req.body into const post
        owner: req.user._id // add an addional property owner, which is the ID of req.user in auth
    })

    try {
        await post.save();
        res.status(201).send(post);
    } catch (e) {
        res.status(400).send(e);
    }  

    // post.save().then(() => {
    //     res.status(201).send(post);
    // }).catch((error) => {
    //     res.status(400).send(error);
    // });
});

//find and read posts
// example: GET /posts?completed=false  -> returns posts that are just completed
//  pagination: seperate fetched resulsts into blcoks (i.e. seperate pages like google search results)
// example: GET /posts?limit=10&skip=10         ->  limit allows to limit amount of results we get back. skips specifies the amount of results we want skipped over
//Sorting example: Get /posts?sortBy=createdAt:desc
//NOTE** all values passed in url query are STRINGS
router.get('/posts', auth, async (req,res) => {
    //make a match object that we then pass into the match property in populate parameters
    const match = {};
    const sort = {};

    //check if completed query was provided
    if(req.query.completed){
        //req.query.completed is a STRING. check if the string is "true", then set match.completed to true (otherwise false)
        match.completed =  req.query.completed === "true";  
    }

    //check if sortBy query was provided
    if(req.query.sortBy){  
        const parts = req.query.sortBy.split(":")   //split string value in query i.e. "createdAt:desc" into "createdAt", "desc"
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }

    try {
        await req.user.populate({
            //path is path to populate the posts
            path: 'posts',
            //match is an object to specify which objects we are trying to match
            match, // shorthand for match: match
            options: {
                limit: parseInt(req.query.limit),    //pass limit in query string to parseInt
                skip: parseInt(req.query.skip),
                sort        // sort: sort
            }
        }).execPopulate();
        
        //alternative way, this finds ALL posts that belong to the user
        //const posts = await Post.find({owner: req.user._id});

        res.send(req.user.posts);
    } catch (e) {
        res.status(500).send();
    }

    // Post.find({}).then((posts) => {
    //     res.send(posts);
    // }).catch(() => {
    //     res.status(500).send();
    // });
});

router.get('/posts/:id', auth, async (req,res) => {
    const _id = req.params.id;

    try {
        //const post = await Post.findById(_id);

        //use findOne() to search by _id of post as well as _id of the owner        
        const post = await Post.findOne({ _id, owner: req.user._id });  
        if(!post)
        {
            return res.status(404).send();
        }

        res.send(post);
    } catch(e) {
        res.status(500).send();
    }   

    // Post.findById(_id).then((post) => {
    //     if(!post){
    //         return res.status(404).send();
    //     }

    //     res.send(post);
    // }).catch(() => {
    //     res.status(500).send();
    // });
});

//update post
router.patch('/posts/:id', auth, async (req,res) => {
    const id = req.params.id;
    const updates = Object.keys(req.body);
    const validUpdates = ['description', 'completed'];

    const allowUpdate = updates.every((update) => validUpdates.includes(update));

    if (!allowUpdate)
    {
       return res.status(400).send();
    }

    try {
        const post = await Post.findOne({_id: req.params.id, owner: req.user._id});        
        //const post = await Post.findByIdAndUpdate(id, req.body, {new: true, runValidators: true});

        if(!post)
        {
            return res.status(404).send();
        }

        updates.forEach((update) => {
            post[update] = req.body[update];
        });

        await post.save();

        res.send(post);
    } catch (e) {
        res.status(500).send(e);
    }
      

});

router.delete('/posts/:id', auth, async(req,res) => {
    try {
        const post = await Post.findOneAndDelete({_id:req.params.id, owner: req.user._id});
        
        if (!post)
        {
            return res.status(404).send();
        }

        res.send(post);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;