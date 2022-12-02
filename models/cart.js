
const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    item_id: {
        type: String,
        required: true,
        unique: true
    },
    user_id:{
        type: String,
        required: true,
    },
    name:String,
    price:Number,
    quantity:Number,
    image: String
});

module.exports = cartSchema;