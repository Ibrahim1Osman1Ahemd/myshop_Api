const Category = require("../../models/category.model");
const { Product } = require("../../models/products.model");



async function httpPostCategory (req,res) {
    try {
        const {name} = req.body;
        if(!name) {
            return res.status(400).json({
                status: 'fail',
                data: null,
                message : 'The category name is required!'
            })
        }
        const findCategory = await Category.findOne({name});
        if(findCategory) return res.status(400).json({
            status:"fail",
            message: "The category is allready exsist!",
            data: null
        })
        let category = await Category({
            name,
        });
        category = await category.save();
        if(!category) return res.status(500).json({
            status: 'err',
            message : 'error',
            data: null
        });
        return res.status(201).json({
            status: 'success',
            data: {category},
        })

    } catch (err) {
        reject(err)
        if(err.message === ' Category validation failed: name: Path `name` is required.') return res.status(400).json({
            status: 'fail',
            message: 'you hamve to inter the category name!'
        })
        res.status(500).json(err.message)
    }
}

async function httpGetCategories (req,res)  {
    try {
        
    } catch (err) {
        res.status(500).josn({
            status: "error",
            message: err.message
        });
    }
    let categories = await Category.find();
    res.status(200).json({
        status: 'Success',
        data: {
            categories,
        },
    });
}


module.exports = {
    httpPostCategory,
    httpGetCategories,
}