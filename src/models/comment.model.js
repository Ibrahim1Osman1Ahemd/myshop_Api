const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    createdUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    nestedComments: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Comment',
    }]

});

const Comment = mongoose.model("Comment",commentSchema);

module.exports = Comment;