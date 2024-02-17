/*
* this is user controller 
* in this file there are every thing about users
*
*/

// those are bulitin functions and classes
const fs = require('fs');
const path = require('path');

// bcrypt for hashing the password and jwt for the tokens
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

// this is the user model
const  User= require("../../models/users.model");

// this is mongoose lib and i use it here for verfi the user id if is real mongo id or not and if the user with this id is exist or not
const { default: mongoose } = require('mongoose');

// this function for deleting the files form 
function ifThereClientError(fileName , witchFile) {
    if(fileName === '1704872611044-avatar2.png') return
    fs.unlink(path.join(__dirname , '..'  , '..', '..', 'public' , 'uploads' ,`${witchFile}`,`${fileName}`) , (err) => {
        if(err) console.log(err)
    })
}

// new user function
async function register(req , res) { 
    try {
        
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/users_images/`
        let fileName = '1704872611044-avatar2.png'
        if(req.file){
            fileName = req.file.filename;
        }
        const {username , password , rePassword} = req.body;

        if(!username || !password || !rePassword) {
            ifThereClientError(fileName , 'users_images')
            return res.status(400).json({
                error : 'Missing user Data',
            })
        }
        if(password !== rePassword) {
            ifThereClientError(fileName , "users_images")
            return res.status(400).json({
                message : 'The Password dosn\'t match'
            })
        }
        // FIND USER
        
        const findUser = await User.findOne({username});

        if(findUser) { 
            ifThereClientError(fileName , 'users_images')
            return res.status(400).json({
                message : 'Wrong password or username',
            })
        }
        let user = await User({
            username,
            hashPassword: bcrypt.hashSync(password , 10),
            profileImg: `${basePath}${fileName}`
        })
        user = await user.save()
        if(!user){
            ifThereClientError(fileName , 'users_images')
            return res.status(500).json({status: 'err', data: null})
        }
        const token = jwt.sign({
            userId:user._id,
        },
        process.env.SECRET_KEY,
        {
            expiresIn: '40d'
        })
        return res.status(201).json({
            status: 'success',
            data: {
                token: token,
                username: user.username,
                userId: user._id,
                profileImg: user.profileImg,
            },
            message : 'Created a new accuont succesfully!'
        })
    } catch (err) { 
        console.log(err)
        return res.status(500).json({
            error : err,
            message : err.message
        })
    }
    
};


// login function
async function login(req , res) {
    try {
        // FIND USER
        const {username , password} = req.body;
        const findUser = await User.findOne({username});

        if(!findUser) { 
            return res.status(400).json({
                message : 'This account dosn\'t exisit',
            });
        };
        const matchPassword = await bcrypt.compare(password , findUser.hashPassword)
        if(!matchPassword) {
            return res.status(400).json({
                message : 'Wrong password or username',
            });
        };
        const token = jwt.sign({
            userId: findUser._id,
        },
        process.env.SECRET_KEY,
        {
            expiresIn: '40d'
        })
        res.status(200).json({
            status: 'success',
            data: {
                token,
                username: findUser.username,
                userId: findUser._id,
                about: findUser.about,
                phoneNumber: findUser.phoneNumber,
                profileImg: findUser.profileImg,
            },
            message: 'Loged In Successfully!'
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            error : err.message,
        })
    }
}

// this function for get the user with the id 
async function httpGetUser (req,res) {
    const userId = req.params.userId;
    if(!mongoose.isValidObjectId(userId)) return res.status(400).json({
        status: "fail",
        messaage: "Cann't find this user pleace try again letter!",
        data: null,
    })
    const user = await User.findById(userId).select("-hashPassword")
    if(!user) {
        return res.status(400).json({
            status: "fail",
            message: "The user is not defind",
            data: null
        });
    }
    return res.status(200).json({
        stauts: 'success',
        data: {
            user,
        },
        message: "Found User Successfully!"
    })
}


// update user profile function
async function updateUser(req,res) {
    // get the user id
    const token = req.headers.authorization.split("\"")[1];
    const userId = jwt.verify(token,process.env.SECRET_KEY).userId;
    // this is the request body
    const {username , password ,rePassword , phoneNumber , about} = req.body;
    // find the user
    const user = await User.findById(userId);

    // the new data obj
    let updateData = {};
    // if there an image we  are append it to the new data obj
    if(req.file){
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/users_images/`
        let fileName = req.file.filename;
        updateData = {...updateData , profileImg:`${basePath}${fileName}`};
    }
   // and allso we do that for about , phone number and password
   about? updateData = {...updateData , about} : updateData = updateData;
   phoneNumber? updateData = {...updateData , phoneNumber} : updateData = updateData;
   password? updateData = {...updateData , hashPassword: bcrypt.hashSync(password,10)}: updateData = updateData;
   if (username) {
       const FindUserByUsername = await User.find({username: username});
       console.log(FindUserByUsername)
       if(FindUserByUsername.length !== 0) return res.status(400).json({
           status: "fail",
           message: "This usrename is allredy in used",
        })
        username? updateData = {...updateData , username}: updateData = updateData;
    }
    // after that here where we are update the user profile 
    User.findByIdAndUpdate(userId,updateData,{
        new: true,
    }).select("-hashPassword")
    // then return message back to the client about the new data
    .then((user) => { 
        return res.status(200).json({
            status: "success",
            message: "Updated Successfully!",
            data: {
                user,
            },
        });
    })
    // if there an error we send message about the error to client 
    .catch((err) => {
        return res.status(400).json({
            data: null, 
            status: "fail",
            message: err.message
        });
    })
    console.log(user.profileImg.split("http://localhost:3000/public/uploads/users_images/")[1])
    if(req.file) ifThereClientError(user.profileImg.split("http://localhost:3000/public/uploads/users_images/")[1],"users_images")

}


// export the function to be readble from any bart of the project
module.exports = { 
    register,
    login,
    httpGetUser,
    updateUser,
    ifThereClientError,
}