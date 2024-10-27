const mongoose = require('mongoose');

const Schema =  mongoose.Schema;

const foodSchema = new Schema({
    food_name:{
        type : String
        // required : true
    },
    cal_count:{
        type : Number
    },
    density:{
        type : Number
    },
    isActive: {
        type : Boolean,
        default : true
        // required : true
    },
    isDeleted: {
        type : Boolean,
        default : false
        // required : true
    }
}, {timestamps:true});

module.exports = mongoose.model('food',foodSchema);