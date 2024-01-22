const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { error } = require("console");
const fs = require("fs").promises;
const fast2sms = require("fast-two-sms");

const userController = {
  userSignup: async (req, res) => {
    try {
      const { userId, userName, password,phoneNumber } = req.body;
      const image = req.file;
      const existing = await User.findOne({ userId });
      if (existing) {
        return res
          .status(409)
          .json({ success: false, message: "User already exists" });
      }

      // const otp = Math.floor(100000 + Math.random() * 900000);
      // const message = `Your OTP for registration is: ${otp}`;
      // await fast2sms.sendMessage({ 
      //   authorization: process.env.BSGlU4oDvscex85gMIQYq0n3aKFANfLdzZiWJ7XtEphRyV9kO2XCqJEWvbAyuFRfathdOmB7LDc8IrMz,
      //    message,
      //     numbers: [phoneNumber] 
      //   });

      // const response = await fast2sms.sendMessage(options);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        userId,
        userName,
        password: hashedPassword,
        phoneNumber,
        image: image.path,
        // otp,
      });

      // if (response && response.data) {
      //   console.log('OTP sent successfully:', otp);

      //   user.otp = otp;
      // }
      await user.save();
      // res.render("otpVerification",{userId, phoneNumber});
      // res.status(201).json({message:"User registered successfully"});
    } catch (error) {
      console.error(error);
      // res.status(500).json({error:"Internal server error",details:error.message});
    }
  },

  userLogin: async (req, res) => {
    try {
      console.log("Received request body in userController: ", req.body);
      const { userId, password } = req.body;
      const user = await User.findOne({ userId });

      if (user && (await bcrypt.compare(password, user.password))) {
        // Generate a token
        const token = jwt.sign(
          { userId: user.userId, userName: user.userName },
          "abc",
          {
            expiresIn: "24h", // Token expiry time
          }
        );
        console.log("token:", token);
        
        return token;
        // res.status(200).json({ message: 'Login successful', token });
      } else {
        // res.status(401).json({ error: 'Unauthorized', details: 'Invalid credentials' });
        return null;
      }
    } catch (error) {
      console.error(error);
      // res.status(500).json({ error: 'Internal Server Error', details: error.message });
      throw error;
    }
  },

  getUsersList: async (req, res) => {
    try {
      const token = req.cookies.authToken;

      try {
        const decodedToken = jwt.verify(token, "abc");
        const loggedInUserId = decodedToken.userId;

        const users = await User.aggregate([
          { $match: { userId: { $ne: loggedInUserId } } },
          {
            $project: {
              _id: 0,
              userId: 1,
              userName: 1,
            },
          },
        ]);

        return { users, loggedInUserId};
        // res.status(200).json({ users: userStrings });
      } catch (verifyError) {
        console.error(verifyError);
        // res.status(401).json({ error: "Unauthorized", details: "Invalid token" });
        return null;
      }
    } catch (error) {
      console.error(error);
      // res.status(500).json({ error: "Internal Server Error", details: error.message });
      throw error;
    }
  },
  verifyOtp :async(req,res)=>{
    try{
      const {userId, phoneNumber, otp}= req.body;
      const user = await User.findOne({userId, phoneNumber, otp});
      if(user){
        user.verified=true;
        await user.save();
        redirect("/login");
      }else{
        throw error;
      }
    }catch(error){
      console.error(error);
    }
  }
};

module.exports = userController;
