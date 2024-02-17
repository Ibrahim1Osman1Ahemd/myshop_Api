
const path = require('path')
const multer = require('multer');
const express = require('express')
const productsRouter = express.Router();

const storage = multer.diskStorage ({
    destination : (req , file , cb) => {
        let error = null;
        const {title , description ,price ,category,countInStock ,richDescription} = req.body || {};
        if(!title) {
            error = new Error("you have to write the title");
        }
        else if(!description) {
            error  = new Error("You have to post the description");
        }
        else if(!price) {
            error = new Error("You have to post The price");
        }
        else if(!category) {
            console.log(req.body)
            error = new Error('You have to post the category');
        }
        else if(!countInStock) {
            console.log(req.body)

            error = new Error("You have to post Count in the stock");
        }
        cb(error , path.join(__dirname ,
             '..' ,'..' , '..' , 'public'
             , 'uploads' , 'products_images'))
    },
    filename: (req , file , cb) => {
        const fileName = file.originalname.split(' ').join('-');
        cb(null , Date.now() + '-' + fileName);
    }
});

const uploadOptions = multer({storage : storage})

const {
    httpGetAllProducts,
    httpGetProduct,
    httpPostNewProduct,
    updateProduct,
    deleteProduct,
    httpGetPrices,
} = require('./products.controller');
const auth = require('../../../helper/jwt');


productsRouter.get('/products' , httpGetAllProducts) ;
productsRouter.get('/products/get/prices' , httpGetPrices) ;
productsRouter.get('/products/:productId' , httpGetProduct) ;
productsRouter.post('/products' , auth ,uploadOptions.single('image'), (req,res,next) => {
   next()
}, httpPostNewProduct);
productsRouter.put('/products/:productId' , auth, updateProduct) ;
productsRouter.delete('/products/:productId' , auth, deleteProduct) ;
// productsRouter.get('/api/profile' , httpGetUserProducts)


module.exports = productsRouter;