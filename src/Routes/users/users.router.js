
const express = require('express');

const usersRouter =  express.Router();

const multer = require('multer');
const path = require('path')
const storage = multer.diskStorage({
    destination : (req , file ,cb) => {
        cb(null , path.join(__dirname,'..','..','..','public','uploads','users_images'));
    },
    filename : (req , file , cb) => {
        const fileName = file.originalname.split(' ').join('-');
        cb(null , Date.now() + '-' + fileName);
    }
});

const uploadOption = multer({storage : storage});

const {
    register,
    login,
    updateUser,
    httpGetUser,
} = require('./users.controller');
const {
    usernameValidate,
    phoneNumberVaildate,
    aboutUserVaildate,
} = require('../../../helper/vaildation')
const auth = require('../../../helper/jwt');

usersRouter.post('/register' , uploadOption.single('profileImg'), register);

usersRouter.post('/login' , login);
//update user this route can update one or more than one row every time you send request;
usersRouter.put(
    '/users/profile/update' ,
    // auth function this for auth 
    auth , 
    // this is for handle the fromData 
    uploadOption.single("profileImg"),
    // this is the username validate middelwere
    usernameValidate,
    // this is the phone number validate middelwere
    phoneNumberVaildate,
    // this is the about the user validate middelwere
    aboutUserVaildate,
    // this is update fucntion 
    updateUser,
)

usersRouter.get('/users/get/:userId' , auth,httpGetUser)

module.exports = usersRouter;