const jwt = require('jsonwebtoken');
const Comment = require('../../models/comment.model');
const {Product} = require('../../models/products.model');
const { default: mongoose } = require('mongoose');



async function httpPostComment(req,res) {
    const { content , productId} = req.body;
    if(!content) return res.status(400).json({
        status: "fail",
        message: "The Comment's Message Is Required!",
        data: null,
    })
    else if(!productId) {
        return res.status(400).json({
            stauts: 'fail',
            message: 'The Product Id Is Required!',
            data: null,
        });
    };
    const product = await Product.findById(productId);
    if(!product) {
        return res.status(400).json({
            stauts: 'fail',
            message: 'failer!'
        })
    }
    const token = req.headers.authorization.split("\"")[1];
    const userId = jwt.verify(token,process.env.SECRET_KEY).userId;

    let comment =   new Comment({
        content,
        createdUser: userId,
    });
    comment = await comment.save();
    const comments = product.comments;
    comments.push(comment._id)
        
    await product.updateOne({
        comments :comments,
    });
    // await product.save();

    if(!comment) {
        return res.status(400).json({
            stauts: 'fail',
            message: 'We Cann\'t Save The Comment Try Again Letter!'
        });
    };

    return res.status(201).json({
        data: comment,
        stauts: 'success',
        message: 'Created A New Comment Successfully!',
    });
    
}

async function httpDeleteComment(req,res) {
    try {
            const commentId = req.params.commentId;

            const token = req.headers.authorization.split("\"")[1];
            const userId = jwt.verify(token,process.env.SECRET_KEY).userId;

            let comment = await Comment.findById(commentId);

            if(!comment) return res.status(400).json({ 
                stauts: "fail",
                message: "Couldn\'t Find The Comment!",
                data : null,
            })
            if(comment.createdUser.toString() !== userId) return res.status(401).json({
                status: "fail",
                message: "You Donn\'t Have Permission To Delete This Comment!",
                data: null,
            });

            comment = await Comment.findByIdAndDelete(commentId);
            res.status(200).json({
                message: "Delete comment successfully!",
                status : "success",
                data: comment,
            });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ 
            status : "error",
            message: err.message,
            data: null
        })
    }
}


async function replyComment (req,res) {
    const { content , commentId} = req.body;
    if(!content) return res.status(400).json({
        status: "fail",
        message: "The Comment's Message Is Required!",
        data: null,
    })
    else if(!commentId) {
        return res.status(400).json({
            stauts: 'fail',
            message: 'The Comment Id Is Required!',
            data: null,
        });
    };
    const findComment = await Comment.findById(commentId);
    if(!findComment) {
        return res.status(400).json({
            stauts: 'fail',
            message: 'failer!'
        })
    }
    const token = req.headers.authorization.split("\"")[1];
    const userId = jwt.verify(token,process.env.SECRET_KEY).userId;

    let comment =   new Comment({
        content,
        createdUser: userId,
    });
    comment = await comment.save();
    const nestedComments = findComment.nestedComments;
    nestedComments.push(comment._id)
        
    await findComment.updateOne({
        nestedComments :nestedComments,
    });
    // await comment.save();

    if(!comment) {
        return res.status(400).json({
            stauts: 'fail',
            message: 'We Cann\'t Save The Comment Try Again Letter!'
        });
    };

    return res.status(201).json({
        data: comment,
        stauts: 'success',
        message: 'Created A New Comment Successfully!',
    });
}
module.exports = {
    httpPostComment,
    httpDeleteComment,
    replyComment,
}