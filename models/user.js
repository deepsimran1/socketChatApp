const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    image:{
        type:String,
    },
    verified:{
        type:Boolean,
        default:false,
    },
    otp:{
        type:String,
    }
   
    
});

const User = mongoose.model("User", userSchema);

module.exports = User;


//U4X53H1KGRQ2T8N89RA5C5LT