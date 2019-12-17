const app = require('./app');

const port = process.env.PORT;

app.listen(port, () => {
    console.log('server is up on port ' + port);
});


//Use multer to upload files like images or word docs
// const multer = require('multer');
// const upload = multer({ 
//     dest: 'images',  //the files uploaded will be stored in dest
//     limits: {   //set limits for files that are uploaded
//         fileSize: 1000000, //filesize is in Bytes -> 1000000 = 1mb         
//     },
//     //fileFilter is a property function that runs when a new file is attempted to be uploaded 
//     fileFilter(req, file, cb) {     //req: request being made, file: file being uploaded, cb: callback function to tell multer when we're done filtiring file
//         if(!file.originalname.match(/\.(doc|docx)$/))    //use .match() for regular expression -> file ends with either .doc OR .docx
//         {
//             return cb(new Error('file must be a word document')) //example error that is sent back if file isnt a PDF   
//         }
//          cb(undefined, true) //provide true as second parameter if upload went as expected
//         // cb(undefined, false)    //this silently rejects upload (we will just send back an error instead) 
//     }
// });

// //multer provides milddleware
// //multer looks for a file called 'upload' (the string paramater in .single()) when the req comes in
// app.post('/upload', upload.single('upload'), (req,res) => {
//     res.send();
// }, (error, req, res, next) => { //this function is designed to handle errors (All 4 parameters MUST be set)
//     res.status(400).send({error: error.message});   //error.message is from middleware
// });    

//Custome Middleware example: this runs before a rout handler
// app.use((req, res, next) => {
//     if(req.method === 'GET')
//     {
//         res.send('GET requests are disabled');
//     }
//     else {
//         next(); //call next to let express know we are done w/ middleware function (otherwise request will hang)
//     }
// });

//disable HTTP requests through express middleware
// app.use((req, res, next) => {
//     res.status(503).send('all requests are disabled');
// });


//without middleware: new request -> run route handler
//
//with middleware: new request -> do something -> run route handler

//Example on how to populate from ref properties
// const main = async() => {
//     // const post = await Post.findById("5de99a99f3599617c07f9341");
//     // //populate allows us to populate data from a relationship (owner)
//     // await post.populate('owner').execPopulate(); //owner property changes from just being an Id of the user to the entire User Document
//     // console.log(post.owner);

//     const user = await User.findById('5de99a7bf3599617c07f933f');
//     await user.populate('posts').execPopulate();
//     console.log(user.posts);
// }
//
//main();

//This is a small example to show how toJSON runs automatically when JSON.stringify is called
// const pet = {
//     name: "hal"
// }
//
// pet.toJSON = function () {
//     return {};
// } 
//
// console.log(JSON.stringify(pet));


//Example for json web token
// const jwt = require('jsonwebtoken');

// const myFunction = async() => {
//     const token = jwt.sign({ _id: "abc123"}, 'thisismynewcourse', {expiresIn: '7 days' });
//     console.log(token);

//     const data = jwt.verify(token, 'thisismynewcourse');
//     console.log(data);
// }

// myFunction();

