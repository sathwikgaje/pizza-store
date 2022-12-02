const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const joi = require('joi');
const bcrypt = require('bcrypt');
const userSchema = require('../models/user');
const User = mongoose.model('User',userSchema);

function validateUser(user){
    const schema = joi.object({
        name: joi.string().min(3),
        email: joi.string().email(),
        password: joi.string().min(6).max(255),
        phone:joi.number(),
    })
    return schema.validate(user);
}

router.post('/add_user',async (req,res)=>{
    const { error } = validateUser(req.body);
    if(error) {
        req.flash('message',error);
        res.redirect('register'); 
    }  
    let search = await User.findOne({email:req.body.email});
    if(search) {
        req.flash('message',"User already Registered");
        res.redirect('register'); 
    }
    const user = await new User({
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        password:req.body.password,
    });
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, async function(err, hash) {
            user.password = hash;
            await user.save();
            const token = user.generateAuthToken();
            res.cookie('token',token);
            req.flash('message','Logged In Successfully');
            res.redirect('/cart');
        });
    });
});

router.post('/login',async (req,res)=>{
    let user = await User.findOne({email:req.body.email});
    if(!user) {
        req.flash('message','Invaild Email');
        res.redirect('/login')
    }
    hash = user.password;
    const p = new Promise((reslove,reject)=>{
        bcrypt.compare(req.body.password, hash, function(err, result) {
             reslove(result)
        });
    })
    p.then(result=>{
        if(!result) {
            req.flash('message','Invaild Password');
            res.redirect('/login')
        }
        else{
            const token = user.generateAuthToken();
            res.cookie('token',token);
            req.flash('message','Logged In Successfully');
            res.redirect('/cart');
        }
    })
});

router.get('/logout',(req,res)=>{
    res.clearCookie('token');
    req.flash('message','Logged Out');
    res.redirect('/')
});

module.exports = router;