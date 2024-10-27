const mongoose = require('mongoose');

const Schema =  mongoose.Schema;

const historySchema = new Schema({
    userId:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user',
        // required : true
    },
    date:{
        type : Date,
        // required : true
    },
    total_cal:{
        type : Number,
        // required : true
    },
    image_path:{
        type : String,
        // required : true
    },
    food : [
        {
            food_name : {
                type : String
            },
            area : {
                type : Number
            },
            per_unit : {
                type : Number
            },
            cal : {
                type : Number
            }
        }
    ],
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

module.exports = mongoose.model('history',historySchema);