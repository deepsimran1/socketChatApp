const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const messageController= require('../controllers/messageController');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, './uploads');
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({storage});
//user routes
router.post("/signup", userController.userSignup);
router.post('/login', userController.userLogin);
router.get('/getUsersList', userController.getUsersList);
//message routes
router.post('/chat/:receiverUserId',messageController.chat);
router.get('/getConversation', messageController.getConversation);
router.get('/verify-otp', userController.verifyOtp);
  

  
module.exports= router;