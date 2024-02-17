const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const { Product } = require("../../models/products.model");
const { ifThereClientError } = require("../users/users.controller");
const Comment = require('../../models/comment.model')
const Category = require('../../models/category.model');

// GET ALL PRODCTUS //
async function httpGetAllProducts(req ,res) {
    try {
      
        let filter = {};
        const categories = req.query.categories;
        const prices = req.query.prices;
        const productsIds = req.query.productsIds;
        if(categories) filter = {category: categories.split(",")}
        if(req.headers.authorization) filter.createdUser = jwt.verify(req.headers.authorization.split("\"")[1],process.env.SECRET_KEY).userId;
        if(prices) filter = {...filter,price:prices.split(",")};
        if(productsIds) filter = {...filter,_id:productsIds.split(",")};

        let limit = req.query.limit || 10;
        if(limit >20) limit = 20;
        const page = req.query.page * limit || 0;
        const productscount = Math.round(await Product.find(filter).countDocuments() / limit)
        const products = await Product.find(filter).populate({
            path: 'comments' , populate: {
                path: "createdUser" , select: '-hashPassword'
            }
        }).populate('category')
        .populate("createdUser", "-hashPassword")
        .limit(limit).skip(page)
        return res.status(200)
        .json({
            status: 'success',
            data: {
                products: products,
                pages: productscount,
            },
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message : err.message,
        })
    }

}

function httpGetPrices (req,res) {
    Product.find({}).select("price").then((prices) => {
        const filterPrices = new Set(prices.map((item) => item.price))       
        res.status(200).json({
            stauts: "success",
            data: {
                prices: [...filterPrices],
            }
        });
    })
    .catch((err) => {
        return res.status(400).json({
            status: "fail",
            message: err.message,
            data: null
        });
    })
}

async function httpGetProduct(req,res) {
    try {
        const productId = req.params.productId;
        if(!mongoose.isValidObjectId(productId)){
            return res.status(400).json({
                status: 'fail',
                message: 'Not Vaild product Id',
            });
        }
        const product = await Product.findById(productId)
        .populate({
            path:"category",
        })
        .populate({
            path: 'comments' , populate :{
                path: 'createdUser', select: '-hashPassword'
            },
        })
        .populate({
             path: 'createdUser' , select : '-hashPassword',
        });
        let prdouctTow = product.toJSON()
        
        for(let i =0 ; i < product.comments.length ; i++) {
            let comment = product.comments[i];
            if((Date.now() - comment.createdDate) / 1000 < 60)
            {
                // console.log(product.comments[i].createdDate)
                prdouctTow.comments[i].createdDate= "now";
            }
            else if(((Date.now() - comment.createdDate) / 1000 ) / 60 < 60) 
            {
                prdouctTow.comments[i].createdDate= Math.floor(((Date.now() - comment.createdDate) / 1000 ) / 60) + " " + "min ago";
            }
            else if(Math.floor((((Date.now() - comment.createdDate) / 1000 ) / 60) / 60)  < 24) 
            {
                prdouctTow.comments[i].createdDate= Math.floor((((Date.now() - comment.createdDate) / 1000 ) / 60) / 60)  + " " + "hour ago";
            }
            else if(((((Date.now() - comment.createdDate) / 1000 ) / 60) / 60) / 24 < 7) 
            {
                prdouctTow.comments[i].createdDate= Math.round(((((Date.now() - comment.createdDate) / 1000 ) / 60) / 60) / 24 )+ " " + "day ago";
            }
            else if(Math.floor((((((Date.now() - comment.createdDate) / 1000 ) / 60) / 60) / 24) / 7) < 4) 
            {
                prdouctTow.comments[i].createdDate= Math.floor((((((Date.now() - comment.createdDate) / 1000 ) / 60) / 60) / 24) / 7) + " " + "week ago";
            }
            else if(Math.floor(((((((Date.now() - comment.createdDate) / 1000 ) / 60) / 60) / 24) / 7) / 4) < 12) 
            {
                prdouctTow.comments[i].createdDate = Math.floor(((((((Date.now() - comment.createdDate) / 1000 ) / 60) / 60) / 24) / 7 )/ 4) + " " + "month ago";
            }
            else {
                prdouctTow.comments[i].createdDate = "long time ago";
            }
        }
        if(!product) return res.stauts(400).json({
            stauts: 'fail',
            message: 'cluod not found the product!',
        });
        return res.status(200).json({
            status: 'success',
            message: 'Found The product successfully!',
            data: {
                product:prdouctTow,
            }
        })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: err.message
        })
    }
 
} 




async function httpPostNewProduct (req ,res) {
    try{ 
        // get the full path for the product image
        if(!req.file) {
            return res.status(400).json({
                message : 'You have to post at min one image'
            })
        }
        const fileName = req.file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/products_images/`;

        const {title , description ,price ,category,countInStock ,richDescription} = req.body;
        const token = req.headers.authorization.split("\"")[1];
        const userId = jwt.verify(token,process.env.SECRET_KEY).userId;
        
        if(!title || !description || !price || !category || !countInStock) {
            return res.status(400).json({
                success: 'fail',
                message : 'Missing Data'
            })
        }

        // create a product object
        let newProduct = await Product({
            title: req.body.title,
            description : req.body.description,
            category: req.body.category,
            price : req.body.price,
            image : `${basePath}${fileName}`,
            createdUser: userId,
            countInStock,
            richDescription,
        }) 

        // HERE WHERE ACCUTLLY THE Product WILL CEATING //
        newProduct = await newProduct.save()
        if(!newProduct) {
            res.status(400).json({err:'problem with saving the product!'})
        }
        return res.status(201).json({
            status: 'success',
            message: 'The product created successfully',
            data: newProduct,
        })

    } catch (err) { 
        console.log(err)
        return res.status(500).json({
            status: "error",
            message : err.message
        })
    }
}
async function updateProduct (req,res) {
    try {
        const productId = req.params.productId;
        if(!mongoose.isValidObjectId(productId)) return res.status(400).json({
            status: "fail",
            message: "Undfined Product!",
            data: null,
        })
        await checkCreatedUser(req,res,productId,"update")
        const {title, price, description , richDescription} = req.body;
        const product = await Product.findByIdAndUpdate(productId, {
            title: title,
            price: price,
            description: description,
            richDescription: richDescription,
        },{
            new: true,
        });
        if(!product) {
            return res.status(400).json({
                status: "fail",
                message: "Cant found the product!",
                data: null
            })
        }
        return res.status(200).json(product)
    } catch (err) {
        return res.status(500).json(err.message)
    }
   
}

async function deleteProduct (req,res) {
    try {
        const productId = req.params.productId;
        if(!mongoose.isValidObjectId(productId)) return res.status(400).json({
            status: 'fail',
            message: 'Undfined product!',
        })

        await checkCreatedUser(req,res,productId)

        const product = await Product.findByIdAndDelete(productId);
        let prodcutsByCategory = await Product.find({category: product.category});
        if(prodcutsByCategory.length === 0){
            await Category.findByIdAndDelete(product.category);
        }
        if(!product) return res.status(400).json({
            status: 'fail',
            message: "Product was undifined!"
        })
        const imageName = (product.image).split("/products_images/");
        console.log(imageName)
        ifThereClientError( imageName[1] , "products_images");
        const comments = product.comments;
        await Comment.deleteMany({_id: comments});
        
        res.status(200).json({
            stauts: 'success',
            message: "Delete product successfully!",
            data: null,
        })
    } catch (err) {
        return res.status(500).json({
            stauts: 'error',
            message: err.message,
        });
    }
    
}

function checkCreatedUser (req,res,productId,option = 'delete') {
    return new Promise(async (resolve,reject) => {
        const token = req.headers.authorization.split("\"")[1];
        const userId = jwt.verify(token,process.env.SECRET_KEY).userId;
        let product = await Product.findById(productId);

        if(!product) return res.status(400).json({
            status: 'fail',
            message: "Product was undifined!"
        });

        if(product.createdUser.toString() !== `${userId}`) {
            console.log(product.createdUser.toString(), `${userId}`)
            reject()
            return res.status(401).json({
                stauts: 'fail',
                data: null,
                message: `You don\'t have permission to ${option} this  product!`,
            })
        }else{
            resolve()
        }
    })
    
}


module.exports = { 
    httpGetAllProducts,
    httpGetProduct,  
    httpPostNewProduct,
    updateProduct,
    deleteProduct,
    httpGetPrices,
}