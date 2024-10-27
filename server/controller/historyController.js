const usersSchema = require('../model/usersModel');
const historySchema = require('../model/historyModel');
const foodSchema = require('../model/foodModel');
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const {spawn} = require('child_process');


const getAllHistoryByUserId = async(req,res) => {
    try{
        
        if(!req.userInfo || !req.userInfo.userId)
        {
            return res.status(400).json({
                message : "Permission Denied",
                data : null,
                status : "error"
            });
        }

        let userId = req.userInfo.userId;

        let userData = await usersSchema.findOne({_id : userId,isActive : true,isDeleted :false});

        if(!userData)
        {
            return res.status(400).json({
                message : "User not found",
                data : null,
                status : "error"
            });
        }

        let historyData = await historySchema.find({userId :userId,isActive:true,isDeleted:false}).sort({updatedAt :-1});

        return res.status(200).json({
            message : "All history data",
            data : {historyData},
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

 // Define a function to convert a tuple string into a tuple array
function parseTuple(tupleStr) {
    let [name, value] = tupleStr.split(", ");
    name = name.replace(/'/g, '');
    return [name, parseFloat(value)];
}

// For object detection
const uploadAndGetResult1= async(req,res) => {
    try{
        console.log(req.file);
        let uploaded_file_name = req.file.filename;
        let uploaded_file_path = "/original/"+uploaded_file_name;
        let resoponseToSend ={
            image : "",
            date : "",
            total_cal : 0,
            user_id : null,
            food :[]
        };
        resoponseToSend["image"] = uploaded_file_path;
        let dateToEnter = new Date();
        resoponseToSend["date"] = dateToEnter;
        resoponseToSend["total_cal"] = 0;
        resoponseToSend["user_id"] = null;
        resoponseToSend["food"] = [];
        let temp = {};

        let user = null;

        // Checking someone has logged in or not

        // Check user exist or not if yes then add it in his history
        // Fetching token from request
        const token = req.headers["authorization"];

        // If token not present
        if (token) {
            console.log("Found token");
            const tokenPart = token.split(" ");
            if(tokenPart.length >= 2 || tokenPart[0] == "Bearer")
            {
                console.log("Found Bearer");
                try {
                    //Verifying token
                    const decoded = jwt.verify(tokenPart[1], process.env.JWTENCRYPTIONTOKEN);
                    // console.log(decoded);
                    req.userInfo = decoded;
                    let userId = req.userInfo.userId;

                    let userData = await usersSchema.findOne({_id : userId,isActive : true,isDeleted :false}).select('-password');

                    if(!userData)
                    {
                        console.log("User not found");
                        user = null;
                    }
                    else
                    {
                        user = userData;
                    }
                } 
                catch (err) {
                    user = null;
                }
            }                    
        }

                
            // Check done





        // store : /original/req.file.filename

         // spawn new child process to call the python script
         const python = spawn('python3', ['pythonScript/script1.py',"uploads"+uploaded_file_path]);
        //  const python = spawn('python3', ['pythonScript/advanceDetection_1/Tutorial.py',"uploads"+uploaded_file_path]);
         // collect data from script
         python.stdout.on('data', function (data) {
             console.log('Pipe data from python script ...');
             dataToSend = data.toString(); // Append data to the existing variable
            //  console.log(dataToSend)

            // PYTHON MUST SND RESPONSE IN THIS FORMAT
            // [('orange', 2181.8892), ('orange', 2367.9092), ('orange', 1946.5364), ('apple', 2953.6191), ('orange', 1675.6991),('banana', 1242.0635), ('orange', 1599.0326), ('orange', 12573.711), ('orange', 4375.9478)]

         });
 
         await python.stderr.on('data', function (data) {
             console.error('Pipe data from python script (stderr): ' + data);
            //  return res.status(500).json({
            //     message : "File uploaded successfully",
            //     data : {resoponseToSend},
            //     status : "success"
            // });
         })
         // in close event we are sure that stream from child process is closed
         python.on('close', async(code) => {
         console.log(`child process close all stdio with code ${code}`);
         console.log(dataToSend);
         const tuplesStr = dataToSend.slice(1, -1).split("), (");

    
        // Parse the string data into an array of tuples
        const data = tuplesStr.map(parseTuple);
        foodArr = [];
        // Now you can traverse through the array of tuples
            // await data.forEach(async(tuple) => {
            //     const [name, area] = tuple;
            for (const tuple of data) {
                const [name, area] = tuple;
                console.log(`Object: ${name}, Value: ${area}`);
                temp = {
                    cal : 0,
                    food_name  : "",
                    area : 0,
                    per_unit : 0
                };
                temp["cal"] = 0;
                let food_name = (name) ? name : "";
                if(food_name &&  food_name[0] == '(')
                    food_name = food_name.substring(1);
                temp["food_name"] = food_name;
                temp["area"] = area;
                temp["per_unit"] = 0;

                let existFood = await foodSchema.findOne({food_name : food_name,isActive:true,isDeleted : false});

                if(existFood)
                {   console.log("food found");
                    let newCal = parseFloat(area)*existFood.cal_count;
                    resoponseToSend["total_cal"]+= newCal;
                    temp["cal"] = newCal;
                    temp["per_unit"] = existFood.cal_count;
                }

                resoponseToSend["food"].push(temp);
                // delete temp["cal"];
                foodArr.push(temp);
                console.log(temp);
                
            }
            //  res.send(dataToSend)

            // If user is there then do entry in history table
            if(user && user!=null)
            {
                console.log("User Found");
                let historyData = await historySchema.create(
                {
                    userId : user._id,
                    date : resoponseToSend.date,
                    total_cal : resoponseToSend.total_cal,
                    image_path : resoponseToSend.image,
                    food : foodArr
                });    
                console.log(historyData);
            }
            else
            {
                console.log("User not found");
            }


            return res.status(500).json({
                message : "File uploaded successfully",
                data : {resoponseToSend},
                status : "success"
            });
         });

        
        
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({
            message : "Somwthing went wrong",
            data : { error : error.message},
            status : "error"
        });
    }
}

// For Depth
const uploadAndGetResult= async(req,res) => {
    try{
        console.log(req.file);
        let uploaded_file_name = req.file.filename;
        let uploaded_file_path = "/original/"+uploaded_file_name;
        let resoponseToSend ={
            image : "",
            date : "",
            total_cal : 0,
            user_id : null,
            food :[]
        };
        resoponseToSend["image"] = uploaded_file_path;
        let dateToEnter = new Date();
        resoponseToSend["date"] = dateToEnter;
        resoponseToSend["total_cal"] = 0;
        resoponseToSend["user_id"] = null;
        resoponseToSend["food"] = [];
        let temp = {};

        let user = null;

        // Checking someone has logged in or not

        // Check user exist or not if yes then add it in his history
        // Fetching token from request
        const token = req.headers["authorization"];

        // If token not present
        if (token) {
            console.log("Found token");
            const tokenPart = token.split(" ");
            if(tokenPart.length >= 2 || tokenPart[0] == "Bearer")
            {
                console.log("Found Bearer");
                try {
                    //Verifying token
                    const decoded = jwt.verify(tokenPart[1], process.env.JWTENCRYPTIONTOKEN);
                    // console.log(decoded);
                    req.userInfo = decoded;
                    let userId = req.userInfo.userId;

                    let userData = await usersSchema.findOne({_id : userId,isActive : true,isDeleted :false}).select('-password');

                    if(!userData)
                    {
                        console.log("User not found");
                        user = null;
                    }
                    else
                    {
                        user = userData;
                    }
                } 
                catch (err) {
                    user = null;
                }
            }                    
        }

                
            // Check done





        // store : /original/req.file.filename

         // spawn new child process to call the python script
         const python = spawn('python3', ['pythonScript/script_rcnn_custom_depth_coin.py',"uploads"+uploaded_file_path]);
        //  const python = spawn('python3', ['pythonScript/advanceDetection_1/Tutorial.py',"uploads"+uploaded_file_path]);
         // collect data from script
         python.stdout.on('data', function (data) {
             console.log('Pipe data from python script ...');
             dataToSend = data.toString(); // Append data to the existing variable
            //  console.log(dataToSend)

            // PYTHON MUST SND RESPONSE IN THIS FORMAT
            // [('orange', 2181.8892), ('orange', 2367.9092), ('orange', 1946.5364), ('apple', 2953.6191), ('orange', 1675.6991),('banana', 1242.0635), ('orange', 1599.0326), ('orange', 12573.711), ('orange', 4375.9478)]

         });
 
         await python.stderr.on('data', function (data) {
             console.error('Pipe data from python script (stderr): ' + data);
            //  return res.status(500).json({
            //     message : "File uploaded successfully",
            //     data : {resoponseToSend},
            //     status : "success"
            // });
         })
         // in close event we are sure that stream from child process is closed
         python.on('close', async(code) => {
         console.log(`child process close all stdio with code ${code}`);
         console.log(dataToSend);
         const tuplesStr = dataToSend.slice(1, -1).split("), (");

    
        // Parse the string data into an array of tuples
        const data = tuplesStr.map(parseTuple);
        foodArr = [];
        // Now you can traverse through the array of tuples
            // await data.forEach(async(tuple) => {
            //     const [name, area] = tuple;
            for (const tuple of data) {
                const [name, area] = tuple;
                console.log(`Object: ${name}, Value: ${area}`);
                temp = {
                    cal : 0,
                    food_name  : "",
                    area : 0,
                    per_unit : 0
                };
                temp["cal"] = 0;
                let food_name = (name) ? name : "";
                if(food_name &&  food_name[0] == '(')
                    food_name = food_name.substring(1);
                temp["food_name"] = food_name;
                temp["area"] = area;
                temp["per_unit"] = 0;

                let existFood = await foodSchema.findOne({food_name : food_name,isActive:true,isDeleted : false});

                if(existFood)
                {   console.log("food found");
                    let newCal = parseFloat(area)*existFood.cal_count*existFood.density;
                    resoponseToSend["total_cal"]+= newCal;
                    temp["cal"] = newCal;
                    temp["per_unit"] = existFood.cal_count;
                }

                resoponseToSend["food"].push(temp);
                // delete temp["cal"];
                foodArr.push(temp);
                console.log(temp);
                
            }
            //  res.send(dataToSend)

            // If user is there then do entry in history table
            if(user && user!=null)
            {
                console.log("User Found");
                let historyData = await historySchema.create(
                {
                    userId : user._id,
                    date : resoponseToSend.date,
                    total_cal : resoponseToSend.total_cal,
                    image_path : resoponseToSend.image,
                    food : foodArr
                });    
                console.log(historyData);
            }
            else
            {
                console.log("User not found");
            }


            return res.status(500).json({
                message : "File uploaded successfully",
                data : {resoponseToSend},
                status : "success"
            });
         });

        
        
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({
            message : "Somwthing went wrong",
            data : { error : error.message},
            status : "error"
        });
    }
}

module.exports.getAllHistoryByUserId = getAllHistoryByUserId;
module.exports.uploadAndGetResult = uploadAndGetResult;
