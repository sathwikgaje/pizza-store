const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const config = require('config');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const cart = require('./router/cart');
const home = require('./router/home');
const user = require('./router/user');
const admin = require('./router/admin');
const userSchema = require('./models/user');
const User = mongoose.model('User',userSchema);

if(!config.get('PORT')){
    console.log("FATAL ERROR: environmental variable PORT is not set");
    process.exit(1);
}

if(!config.get('jwtPrivateKey')){
    console.log("FATAL ERROR: environmental variable jwtPrivateKey is not set");
    process.exit(1);
}

if(!config.get('adminName')){
    console.log("FATAL ERROR: environmental variable adminName is not set");
    process.exit(1);
}

if(!config.get('adminEmail')){
    console.log("FATAL ERROR: environmental variable adminEmail is not set");
    process.exit(1);
}

if(!config.get('adminPhone')){
    console.log("FATAL ERROR: environmental variable adminPhone is not set");
    process.exit(1);
}

if(!config.get('adminPassword')){
    console.log("FATAL ERROR: environmental variable adminPassword is not set");
    process.exit(1);
}

if(!config.get('admin')){
    console.log("FATAL ERROR: environmental variable admin is not set");
    process.exit(1);
}

mongoose.connect(config.get('db'))
    .then(()=>console.log('Connected to database'))
    .catch((err)=>console.error('Not connected to database',err))

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret:'secret',
    cookie:{maxAge:1000},
    resave:false,
    saveUninitialized:false
}));
app.use(flash());
app.use(helmet());
app.use(compression());
app.use('/',home);
app.use('/user',user);
app.use('/cart',cart);
app.use('/admin',admin);
const port = process.env.PORT;
app.listen(port);
app.set('view engine','ejs');
console.log("Server Started");
console.log(`Running on port${port}`);

bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(config.get('adminPassword'), salt, async function(err, hash) {
        let hashPassword = hash;
        const user = new User({
            name:config.get('adminName'),
            email:config.get('adminEmail'),
            phone:config.get('adminPhone'),
            password:hashPassword,
            isAdmin:config.get('admin')
        });
        await user.save();
    });
});

