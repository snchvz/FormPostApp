const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const User = require('../models/user');
const sharp = require('sharp');
const {sendWelcomeEmail,sendDepartureEmail} = require('../emails/account');    //destructuring object for property sendWelcomeEmail

//Make new user
router.post('/users', async (req,res) => {
    const user = new User(req.body);

    try{
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();

        res.status(201).send({user,token});
    } catch (e){
        res.status(400).send(e);
    }

    //Using promises
    // user.save().then(() => {
    //     res.status(201).send(user);
    // }).catch((error) => {
    //     res.status(400).send(error); //not providing a response leaves the response hanging!
    // });
});

router.post('/users/login', async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();

        res.send({user, token});    //shorthand syntax to define both properties
    } catch (e) {
        res.status(400).send();
    }
});

router.post('/users/logout', auth, async(req,res) => {
    try {
        //tokens is the array property in user
        req.user.tokens = req.user.tokens.filter((token) => {
            //if the token in the array is not the token on the req, keep the token
            //if the token in th array is equal to the token on the req, filter it out
            return token.token !== req.token; //token(element in array with id and token property).token(token property)
        });
        await req.user.save();

        res.send();
    } catch(e) {
        res.status(500).send(e);
    }
});

router.post('/users/logoutall', auth, async(req, res) => {
    try {
        req.user.tokens = [];
        
        await req.user.save();
        res.send();
    } catch(e)
    {
        res.status(500).send(e);
    }
});



//in this case, auth is the middleware function that runs before rout handler (second parameter in router.get() function)
router.get('/users/me', auth, async (req,res) => {
    res.send(req.user); //this gets only the user that was authenticated

    //Using Promises (this gets all Users)
    // User.find({}).then((users) => {
    //     res.send(users);
    // }).catch(() => {
    //     res.status(500).send();
    // });
});

//Example on how to fetch a user by id in path name
//Dont need to use this anymore since /users/me already gives us a user back
// router.get('/users/:id', async (req,res) => {
//     const _id = req.params.id;

//     try{
//         const user = await User.findById(_id);
//         if (!user)
//         {
//             return res.status(404).send();
//         }

//         res.send(user);
//     } catch (e) {
//         res.status(500).send();
//     } 

//     //Using Promise
//     // User.findById(_id).then((user) => {
//     //     if(!user){
//     //         return res.status(404).send();
//     //     }

//     //     res.send(user);

//     // }).catch(() => {
//     //     res.status(500).send();
//     // });
// });

router.patch('/users/me', auth, async(req,res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','email','password','age'];
    const isValidOperation = updates.every((update) =>  allowedUpdates.includes(update));

    if (!isValidOperation)
    {
        return res.status(400).send({error: "invalid update"});
    }

    try {        
        updates.forEach((update) => {
            req.user[update] = req.body[update];    //use [] notation instead of . since it is dynamic
        });

        await req.user.save();
        //findByIdAndUpdate bypasses Mongoose!
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

        res.send(req.user);

    } catch (e) {
        res.status(400).send(e);
    }
});

//Remove your own user profile
router.delete('/users/me', auth, async(req,res) => {
    try {        
        // const user = await User.findByIdAndDelete(req.user._id); //req.user is given back by the middleware auth
        // if (!user)
        // {
        //     return res.status(404).send();
        // }

        //we already have the user bc the middleware returns a user
        await req.user.remove();
        sendDepartureEmail(req.user.email, req.user.name);
        res.send(req.user);

    } catch (e) {
        res.status(500).send(e);
    }
});

const upload = multer({ 
    //NOTE** omitting the dest property allows multer to pass the data through the middleware function
    //dest: 'avatars',  // the files uploaded will be stored in dest (automatically made if it does not already exist)
    limits: {
        fileSize: 1000000 //1mb = 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)) { //regular expression
            return cb(new Error('file must be .png, jpg, or jpeg'));
        }
        cb(undefined, true);
    }
});

//2 middlewares: our auth middleware and the multer upload middleware
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => {
     //NOTE** req.file only accessible if the multer middleware function does NOT have a dest property
    //file.buffer contains the binary data of the file   
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer(); //.png(). converts image to png format
    
    req.user.avatar = buffer;         
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({error: error.message});
});

router.delete('/users/me/avatar', auth, async(req,res) => {
    req.user.avatar = undefined;
    await req.user.save();

    res.send();
});

router.get('/users/:id/avatar', async(req,res) => {
    try {
        const user = await User.findById(req.params.id);

        if(!user || !user.avatar)
        {
            throw new Error()
        }

        // setting a response setter, key-value pair
        res.set("Content-Type","image/png");
        res.status(201).send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
});


module.exports = router;