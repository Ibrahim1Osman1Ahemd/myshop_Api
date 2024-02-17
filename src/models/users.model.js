
const { default: mongoose } = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    hashPassword: {
        type: String,
        required: true
    },
    profileImg: {
        type: String,
        default: "google.com/users/images"
    },
    about: {
        type: String,
        default: "قم بإضافة بعض التفاصيل عنك!",
    },
    phoneNumber: {
        type: String,
        default: "قم بإضافة رقم الهاتف"
    }
});

const User = mongoose.model('User' , UserSchema)
module.exports =   User
