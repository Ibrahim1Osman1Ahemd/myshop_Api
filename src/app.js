const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const  express = require('express');
const auth = require('../helper/jwt');
const { default: mongoose } = require('mongoose');

const app = express();
require('dotenv/config')

//middleware
app.use(express.json());
app.use(cors({origin : 'http://127.0.0.1:5500',}));
app.use(morgan('tiny'));
app.use('/profile', auth , (req,res) => res.send("Auth"));

// routes

// app.post('/',(req,res) => req.headers.authorization)
const API_URL = process.env.API_URL
const usersRouter = require('./Routes/users/users.router');
const productsRouter = require('./Routes/products/products.router');
const categoriesRouter = require('./Routes/categories/categories.router');
const commentsRouter = require('./Routes/comments/comments.router');


app.use('/public/uploads',express.static(path.join(__dirname , '..' , 'public' , 'uploads')));
app.use(API_URL,productsRouter);
app.use(API_URL,usersRouter);
app.use(API_URL,categoriesRouter);
app.use(API_URL,commentsRouter);

mongoose.connect(process.env.DATABASE)
.then(() => console.log('Datebase connection is ready!'))
module.exports = app ;