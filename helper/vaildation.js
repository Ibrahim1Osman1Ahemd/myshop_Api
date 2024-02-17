function newProductValidation (req,res,next) {
    const {title , descriprion ,price ,category,countInStock ,richDescription} = req.body || {};
     console.log(req._readableState.buffer)
    // return res.json({haed:req._readableState.buffer.head.data, tail:(req._readableState.buffer.tail.data).toString()})
    if(!title) return res.status(400).json({
        stauts: "fail",
        message: "يجب عليك ان تكتب اسم المنتج",
        data: null
    });
    else if(!descriprion) return res.status(400).json({
        stauts: "fail",
        message: "يجب عليك ان تكتب وصف المنتج",
        data: null
    });
    else if(!price) return res.status(400).json({
        stauts: "fail",
        message: "يجب عليك ان تكتب سعر المنتج",
        data: null
    });
    else if(!category) return res.status(400).json({
        stauts: "fail",
        message: "يجب عليك ان تكتب وصف المنتج",
        data: null
    });
    else if(!countInStock) return res.status(400).json({
        stauts: "fail",
        message: "يجب عليك ان تكتب الكمية المتوفرة من المنتج",
        data: null
    });
    else{
        next()
    }
}




function usernameValidate(req,res,next) {
    const {username} = req.body;
    if(username) {
        if(username.length > 8 && /\w/g.test(username) && !/\s/.test(username)) {
            next();
        }else {
            console.log(/\s/g.test(username),username.length > 8)
            return res.status(400).json({
                message: "This username is inValid :)",
                staust: "fail"
            })
        }
    }else {
        next()
    }
}

function phoneNumberVaildate(req,res,next) {
    const {phoneNumber} = req.body;
    if(phoneNumber) {
        if(phoneNumber.length === 10 && /0{1,9}\d+/g.test(phoneNumber) && !/{\s , \W , \w}/.test(phoneNumber)) {
            next()
        }else {
            return res.status(400).json({
                message: "This phone number is inValid :)",
                staust: "fail"
            })
        }
    }else {
        next()
    }
}

function aboutUserVaildate(req,res,next) {
    const {about} = req.body;
    if(about) {
        if(about.length <= 133) {
            next()
        }else {
            return res.status(400).json({
                message: "Your infromation is so longer than information length :)",
                staust: "fail"
            })
        }
    }else {
        next()
    }
}

module.exports = {
    newProductValidation,
    usernameValidate,
    phoneNumberVaildate,
    aboutUserVaildate,
}