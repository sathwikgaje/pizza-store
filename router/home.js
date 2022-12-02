const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const itemSchema = require('../models/item');
const Food_item = mongoose.model('Food Item',itemSchema);
const userSchema = require('../models/user');
const User = mongoose.model('User',userSchema);
const cartSchema = require('../models/cart');
const Cart = mongoose.model('Cart',cartSchema);

router.get('/',async(req,res)=>{
    let logged = false;
    let itemids = [];
    let count = false;
    if(req.cookies.token != null){
        logged = true;
        const token = req.cookies.token;
        jwt.verify (token,config.get('jwtPrivateKey'),(err, user)=>{
            req.user = user;
        });
        const user_id = req.user._id;
        const items = await Cart.find({user_id:user_id});
        items.forEach((i)=>{
            itemids.push(i.item_id);
        });
    }
    let pizza = await Food_item.find({category:'Pizza'});
    let burger = await Food_item.find({category:'Burger'});
    let juice = await Food_item.find({category:'Juice'});
    let pasta = await Food_item.find({category:'Pasta'});
    res.render('pages/index',{pizza:pizza,burger:burger,juice:juice,pasta:pasta,logged:logged,itemids:itemids,count:count,message:req.flash('message')});
});

router.get('/products',async(req,res)=>{
    let logged = false;
    let itemids = [];
    let count = false;
    if(req.cookies.token != null){
        logged = true;
        const token = req.cookies.token;
        jwt.verify (token,config.get('jwtPrivateKey'),(err, user)=>{
            req.user = user;
        });
        const user_id = req.user._id;
        const items = await Cart.find({user_id:user_id});
        items.forEach((i)=>{
            itemids.push(i.item_id);
        });
    }
    const pizza = await Food_item.find({category:'Pizza'});
    const burger = await Food_item.find({category:'Burger'});
    const juice = await Food_item.find({category:'Juice'});
    const pasta = await Food_item.find({category:'Pasta'});
    res.render('pages/products',{pizza:pizza,burger:burger,juice:juice,pasta:pasta,logged:logged,itemids:itemids,count:count,message:req.flash('message')});
});

router.get('/about',(req,res)=>{
    let logged = false;
    if(req.cookies.token != null){
        logged = true;
    }
    res.render('pages/about',{logged:logged,message:req.flash('message')});
});

router.get('/checkout',authenticateToken,(req,res)=>{
    res.render('pages/checkout',{message:req.flash('message')});
});

router.get('/register',(req,res)=>{
    res.render('pages/register',{message:req.flash('message')});
});

router.get('/login',(req,res)=>{
    res.render('pages/login',{message:req.flash('message')});
});

router.get('/new',authenticateAdmin,(req,res)=>{
    res.render('pages/new',{message:req.flash('message')});
});

router.get('/users',authenticateAdmin,async (req,res)=>{
    const user = await User.find();
    res.render('pages/users',{result:user,message:req.flash('message')});
});

router.get('/food_items',authenticateAdmin,async (req,res)=>{
    const items = await Food_item.find();
    res.render('pages/food_items',{result:items,message:req.flash('message')});
});

router.post('/edit',authenticateAdmin,async (req,res)=>{
    if(req.body.id){
        var id = req.body.id;
        const items = await Food_item.findById(id);
        res.render('pages/items',{result:items,message:req.flash('message')});
    }
    else{
        let result = false;
        res.render('pages/items',{result:result,message:req.flash('message')});
    }
});

router.post('/single_product',async(req,res)=>{
    let logged = false;
    let count = false;
    const id = req.body.id;
    if(req.cookies.token != null){
        logged = true;
        const token = req.cookies.token;
        jwt.verify (token,config.get('jwtPrivateKey'),(err, user)=>{
            req.user = user;
        });
        const user_id = req.user._id;
        const items = await Cart.find({user_id:user_id});
        items.forEach((item)=>{
            if(id == item.item_id){
                count = true;
            }
        });
    }
    const result = await Food_item.findById(id);
    res.render('pages/single_product',{logged:logged,result:result,count:count,message:req.flash('message')});
});

function authenticateToken(req,res,next) {
    const token = req.cookies.token;
    if (token == null) {
        req.flash('message','Login to Contiune');
        res.redirect('/');
    }
    jwt.verify (token,config.get('jwtPrivateKey'),(err, user) => {
    if (err) {
        req.flash('message','Login to Contiune');
        res.redirect('/');
    }
    next();
    });
}

function authenticateAdmin(req,res,next) {
    const token = req.cookies.token;
    if (token == null) {
        req.flash('message','Only Admin can login');
        res.redirect('/');
    }
    jwt.verify (token,config.get('jwtPrivateKey'),(err, user) => {
    if (err) {
        req.flash('message',err);
        res.redirect('/');
    }
    if(user.isAdmin){
        next();
    }
    else{
        req.flash('message','Only Admin can login');
        res.redirect('/');
    }
    });
}

module.exports = router;