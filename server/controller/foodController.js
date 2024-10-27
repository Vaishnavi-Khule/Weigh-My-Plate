const foodSchema = require('../model/foodModel');

const getAllFood= async(req,res) => {
    try{
        
        let foodData = await foodSchema.find({isActive:true,isDeleted:false}).sort({updatedAt:-1});

        return res.status(200).json({
            message : "All Food data",
            data : {foodData},
            status : "success"
        });
    }
    catch(error)
    {
        return res.status(500).json({
            message : "Somwthing went wrong",
            data : { error : error.message},
            status : "error"
        });
    }
}

const addFood = async(req,res) => {
    try{
        let { food_name,cal_count,density } = req.body;

        if(!food_name || !cal_count || !density)
        {
            return res.status(400).json({
                message : "Please provide all the  data",
                data : null,
                status : "error"
            });
        }

        let existFood = await foodSchema.findOne({ food_name : food_name , isActive : true,isDeleted : false});

        if(existFood)
        {
            return res.status(400).json({
                message : "Same food exists",
                data : null,
                status : "error"
            });
        }

        let foodData = await foodSchema.create({ food_name,cal_count,density });

        return res.status(200).json({
            message : "Food Added Successfully",
            data : {foodData},
            status : "success"
        });
    }
    catch(error)
    {
        return res.status(500).json({
            message : "Somwthing went wrong",
            data : { error : error.message},
            status : "error"
        });
    }
}

module.exports.getAllFood = getAllFood;
module.exports.addFood = addFood;