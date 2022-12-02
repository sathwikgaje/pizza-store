
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const config = require('config');
const cartSchema = require('../models/cart');
const Cart = mongoose.model('Cart',cartSchema);
const jwt = require('jsonwebtoken');

router.get('/',authenticateToken,async(req,res)=>{
    total = 0;
    const id = req.user._id;
    const cart = await Cart.find({user_id:id});
    await cart.forEach((item)=>{
        total = total + item.price * item.quantity;
    });
    res.render('pages/cart',{result:cart,total:total,message:req.flash('message')});
});

router.post('/add_to_cart',authenticateToken,async(req,res)=>{
    var item_id = req.body.item_id;
    var user_id = req.user._id;
    var name = req.body.name;
    var price = req.body.price;
    var quantity = req.body.quantity;
    var image = req.body.image;
    const cart = await new Cart({
        user_id:user_id,
        item_id:item_id,
        name:name,
        price:price,
        quantity:quantity,
        image:image,
    });
    cart.save();
    res.redirect('/cart');
});

router.post('/remove',async (req,res)=>{
    var id = req.body.id;
    await Cart.deleteOne({_id:id});
    res.redirect('/cart');
});

router.post('/add_quantity',(req,res)=>{
    var id = req.body.id;
    async function updateQuantity(id){
        const item = await Cart.findById(id);
        item.quantity = item.quantity + 1;
        await item.save();
    }
    updateQuantity(id);
    res.redirect('/cart');
});

router.post('/remove_quantity',(req,res)=>{
    var id = req.body.id;
    async function updateQuantity(id){
        const item = await Cart.findById(id);
        if(item.quantity <= 1){
            await Cart.deleteOne({_id:id});
        }
        else{
            item.quantity = item.quantity - 1;
            await item.save();
        } 
    }
    updateQuantity(id);
    res.redirect('/cart');
});

function authenticateToken(req,res,next) {
    if(req.cookies.token){
        const token = req.cookies.token;
    if (token == null) {
        req.flash('message','Login to Contiune');
        res.redirect('/products');
    }
    jwt.verify(token,config.get('jwtPrivateKey'),(err, user) => {
    if (err) {
        req.flash('message','Login to Contiune');
        res.redirect('/products');
    }
    req.user = user;
    next();
    });
    }else{
        req.flash('message','Login to Contiune');
        res.redirect('/products');
    }
}

module.exports = router;
