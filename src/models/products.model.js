
const { default: mongoose } = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    price: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    richDescription: {
        type: String,
        default: ""
    },
    uploadDate :{
        type: Date,
        default: Date.now,
    },
    image: {
        type: String,
        default: '',
    },
    createdUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rate: {
        type: String,
    },
    countInStock: {
        type: Number,
        required: true,
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    rateCount: {
        type: Number,
        default: 0,
    }
});
const Product = mongoose.model("Product" , productSchema);
module.exports  = {
    Product,
}