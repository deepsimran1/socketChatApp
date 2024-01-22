const mongoose = require('mongoose');

const connectDB = async()=>{
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/chatApp_Socket_2");
        console.log("connection to database successful");
    }catch(error){
        console.error("Error connecting to database:",error);
    }
};

module.exports = connectDB;