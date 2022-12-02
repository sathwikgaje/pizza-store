const joi = require('joi');
const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    price: Number,
    sales_price: Number,
    quantity: Number,
    image: String,
    category: String,
    type: String
});

module.exports = itemSchema;