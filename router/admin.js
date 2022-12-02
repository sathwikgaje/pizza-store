const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const joi = require('joi');
const bcrypt = require('bcrypt');
const config = require('config');
const itemSchema = require('../models/item');
const Food_item = mongoose.model('Food Item',itemSchema);
const userSchema = require('../models/user');
const User = mongoose.model('User',userSchema);
const multer  = require('multer');
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./public/images')
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})
const upload = multer({storage:storage})

router.get('/',authenticateAdmin,(req,res)=>{
    res.render('pages/admin',{message:req.flash('message')});
});

router.post('/new_admin',authenticateAdmin,async(req,res)=>{
    const { error } = validateUser(req.body);
    if(error) {
        req.flash('message','Invalid Credentials')
        res.redirect('/new');   
    }
    let search = await User.findOne({email:req.body.email});
    if(search) {
        req.flash('message','User already exists')
        res.redirect('/new');  
    }
    const user = await new User({
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        password:req.body.password,
        isAdmin:req.body.isAdmin,
    });
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, async function(err, hash) {
            user.password = hash;
            await user.save();
            req.flash('message','Added in Successfully') 
            res.redirect('/users');
        });
    });
});

router.post('/users/remove',authenticateAdmin,async (req,res)=>{
    var id = req.body.id;
    await User.deleteOne({_id:id});
    res.redirect('/admin/users');
});

router.post('/food_items/add',upload.single('uploaded_file'),authenticateAdmin,async (req,res)=>{
    const items = await new Food_item({
        name:req.body.name,
        description: req.body.description,
        price: req.body.price,
        sales_price: req.body.sales_price,
        image:req.file.filename,
        quantity: req.body.quantity,
        category: req.body.category,
        type: req.body.type,
    });
    await items.save();
    res.redirect('/food_items');
});

router.post('/food_items/update',authenticateAdmin,async (req,res)=>{
    var id = req.body.id;
    const items = await Food_item.findById(id);
    items.name = req.body.name;
    items.price = req.body.price;
    items.sales_price = req.body.sales_price;
    items.quantity = req.body.quantity;
    items.image = req.body.image;
    items.category = req.body.category;
    items.type = req.body.type;
    await items.save();
    res.redirect('/food_items');
});

router.post('/food_items/remove',authenticateAdmin,async (req,res)=>{
    var id = req.body.id;
    await Food_item.deleteOne({_id:id});
    res.redirect('/food_items');
});

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

function validateUser(user){
    const schema = joi.object({
        name: joi.string().min(3),
        email: joi.string().email(),
        password: joi.string().min(6).max(255),
        phone:joi.number(),
        isAdmin:joi.boolean(),
    });
    return schema.validate(user);
}

module.exports = router;