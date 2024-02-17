const express = require('express');
const {
    httpPostComment,
    httpDeleteComment,
    replyComment,
} = require('./comments.controller');
const auth = require('../../../helper/jwt')
const router = express.Router();


router.post('/comments', auth,httpPostComment)
router.post('/comments/reply', auth,replyComment)
router.delete('/comments/:commentId', auth , httpDeleteComment)


module.exports = router;