const express = require('express');
const auth = require('../../../helper/jwt');

const router = express.Router();

const { 
    httpPostCategory ,
    httpGetCategories,
} = require('./categories.controller');

router.post('/categories', auth,httpPostCategory)

router.get('/categories',  httpGetCategories)

module.exports = router;
