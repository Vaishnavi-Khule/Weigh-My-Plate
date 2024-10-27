const usersSchema = require('../model/usersModel');
const qandaSchema = require('../model/foodModel');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Generating json web token

const generateJsonWebToken = async(userData) => {
    // console.log(userData);
    const jwtToken = jwt.sign(
        { userId: userData._id },
        process.env.JWTENCRYPTIONTOKEN,
        {
        expiresIn: "24h",
        }
    );
    return jwtToken;
}

const registerUser = async(req,res) => {
    try{
        let { name,email,password } = req.body;

        // Validating all input requirement
        if (!(email && password && name)) {
            return res.status(400).json({
                message : "Please pass all required data",
                data : null,
                status : "error"
            });
        }

        // Checking if user present or not
        const userExist = await usersSchema.findOne({email : email, isActive : true, isDeleted : false});

        if(userExist)
        {
            return res.status(409).json({
                message : "Email already registered",
                data : null,
                status : "error"
            });
        }

        //Encrypting the passeword
        let encryptedPassword = await bcrypt.hash(password, 10);

        //User registration
        let userData = await usersSchema.create(
            {
                name : name,
                email : email,
                password : encryptedPassword
            });

        //Generate token
        const jwtToken = await generateJsonWebToken(userData);
        // console.log(jwtToken);

        let data = userData.toObject();
        data['token'] = jwtToken;
        delete data.password;

        res.status(200).json({
            message : "Registered Successfully",
            data : data,
            status : "success"
        });
    }
    catch(error)
    {
        res.status(400).json({
            message : "Registration got failed",
            data : { error : error.message},
            status : "error"
        });
    }
}

const loginUser = async(req,res) => {
    try{
        let { email,password } = req.body;

        // Validating all input requirement
        if (!(email && password)) {
            return res.status(400).json({
                message : "Please pass all required data",
                data : null,
                status : "error"
            });
        }

        // Checking if user present or not
        const userExist = await usersSchema.findOne({email : email, isActive : true, isDeleted : false});

        if(!userExist)
        {
            return res.status(409).json({
                message : "Email does not exist",
                data : null,
                status : "error"
            });
        }

        //Decrypt the passeword and match the password
        if (await bcrypt.compare(password, userExist.password)) {
            
            //Generate token
            const jwtToken = await generateJsonWebToken(userExist);

            let data = userExist.toObject();
            data['token'] = jwtToken;
            delete data.password;

            res.status(200).json({
                message : "Loggedin Successfully",
                data : data,
                status : "success"
            });
        }
        else
        {
            return res.status(400).json({
                message : "Invalid Credentials",
                data : null,
                status : "error"
            });
        }
    }
    catch(error)
    {
        res.status(400).json({
            message : "Registration got failed",
            data : { error : error.message},
            status : "error"
        });
    }
}

const getUserProfile = async(req,res) => {
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

        let userData = await usersSchema.findOne({_id : userId,isActive : true,isDeleted :false}).select('-password');

        if(!userData)
        {
            return res.status(400).json({
                message : "User not found",
                data : null,
                status : "error"
            });
        }

        return res.status(200).json({
            message : "Profile Info",
            data : {userData},
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

const editUserProfile = async(req,res) => {
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

        let userData = await usersSchema.findOne({_id : userId,isActive : true,isDeleted :false}).select('-password');

        if(!userData)
        {
            return res.status(400).json({
                message : "User not found",
                data : null,
                status : "error"
            });
        }


        let { name,email } = req.body;

        if(!name || !email)
        {
            return res.status(400).json({
                message : "Please provide all the data",
                data : null,
                status : "error"
            });
        }

        let existUser = await usersSchema.findOne({ email : email ,_id: { $ne: userId }, isActive : true,isDeleted : false});

        if(existUser)
        {
            return res.status(400).json({
                message : "User exist with same email id, you can not update it",
                data : null,
                status : "error"
            });
        }

        let updatedUserData = await usersSchema.findOneAndUpdate({ _id : userId , isActive : true,isDeleted : false},{name:name,email:email,role:role},{new:true});

        return res.status(200).json({
            message : "Profile Updated Successfully",
            data : {updatedUserData},
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

const forgotPassword = async(req,res) => {
    try{
        let { email,password } = req.body;

        // Validating all input requirement
        if (!(email && password)) {
            return res.status(400).json({
                message : "Please pass all required data",
                data : null,
                status : "error"
            });
        }

        // Checking if user present or not
        const userExist = await usersSchema.findOne({email : email, isActive : true, isDeleted : false});

        if(!userExist)
        {
            return res.status(409).json({
                message : "Email does not exist",
                data : null,
                status : "error"
            });
        }

        //Encrypting the passeword
        let encryptedPassword = await bcrypt.hash(password, 10);

        await usersSchema.findOneAndUpdate({_id:userExist.id},{password : encryptedPassword});

        return res.status(200).json({
            message : "Password Changed Successfully",
            data : null,
            status : "success"
        });

    }
    catch(error)
    {
        res.status(400).json({
            message : "Registration got failed",
            data : { error : error.message},
            status : "error"
        });
    }
}

module.exports.registerUser = registerUser;
module.exports.loginUser = loginUser;
module.exports.getUserProfile = getUserProfile;
module.exports.editUserProfile = editUserProfile;
module.exports.forgotPassword = forgotPassword;