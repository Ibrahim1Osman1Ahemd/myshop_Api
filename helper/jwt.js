const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
const  User  = require('../src/models/users.model');

function auth(req,res,next) {
    try {
        if(!req.headers.authorization) {
            return res.status(401).json({
                status: 'fail',
                message: 'You have to log in!'
            })
        }
        const token = req.headers.authorization.split("\"")[1];
        const userId = jwt.verify(token,process.env.SECRET_KEY).userId;
        if(userId) {
            if(mongoose.isValidObjectId(userId)) {
                User.findById(userId).then((user) => {
                    if(user) {
                        next()
                    }else{
                        return res.status(401).json({
                            status : 'fail',
                            message: 'This user is not active now!',
                        })
                    }
                })
            }else {
                return res.status(401).json({
                    data: null,
                    message: "العب غيرها!",
                    stauts: 'fail',
                })
            }
        }
    } catch (err) {
        if(err.message === "invalid token" || err.message === "jwt must be provided") {
            return res.status(401).json({
                status: 'fail',
                message: 'UnAuthozraid user!'
            })
        }
        res.status(401).json({message: err.message})
    }
}

module.exports = auth