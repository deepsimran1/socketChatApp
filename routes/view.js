const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const multer = require("multer");
const messageController = require("../controllers/messageController");
const User = require('../models/user');
const io = require('../app');
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, './uploads');
    },
    filename: function (req, file, cb){
        cb(null, Date.now() + '-' + file.originalname);
    },
  });

  const upload = multer({storage});

router.get("/signup", (req, res) => {
    res.render("signup");
  });

  router.post("/signup",upload.single("image"), async (req, res) => {
    try {
      console.log("Received request body:", req.body);
  
      const { userId, userName, password , phoneNumber} = req.body;
      console.log("Received data:", userId, userName, password, phoneNumber);
  
      await userController.userSignup(req, res);
      // res.redirect('/login');
      // res.redirect("/verify-otp?userId=" + userId + "&phoneNumber=" + phoneNumber);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server Error", details: error.message });
    }
  });

//   router.get("/verify-otp", (req, res) => {
//     const { userId, phoneNumber } = req.query;
//     res.render("otpVerification", { userId, phoneNumber });
// });


  router.get('/login', async(req,res)=>{
    res.render("login");
  });

  router.post("/login", async(req,res)=> {
    try{
      console.log("Received request body: ",req.body);
  
      
      const { userId, password } = req.body;
      console.log("Received data:", userId, password);
  
      const token = await userController.userLogin(req,res);
      if(token){
       res.cookie("authToken", token, {httpOnly: true});
       res.redirect('/userList');
        // res.status(200).json({message:'Login successful', token});
      }else{
        res.status(401).json({error: 'Unauthorized', details:'Invalid credentials' });
      }
    }catch(error){
      console.error(error);
      res.status(500).json({error: 'Internal Server Error', details:error.message});
    }
  });



  router.get('/userList', async (req, res) => {
    try {
      const data = await userController.getUsersList(req);
      res.render("userData", { data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  });



  router.get('/chat/:receiverUserId', async (req, res) => {
    const { receiverUserId } = req.params;
    const authToken = req.cookies.authToken;
    try {
        const data = await messageController.getConversation(req);
        console.log("data", data);
        const receiverUser = await User.findOne({ userId: receiverUserId });

        
        if (receiverUser) {
            receiverName = receiverUser.userName;
            receiverImage = receiverUser.image;
            // const senderUserId = authToken.userId;
            // console.log("senderuserid", senderUserId);
            console.log("rceievrimage", receiverImage);
            // console.log("receiverName", receiverName);
            // console.log("data", data);
            // console.log("message", data.conversation);
            res.render('chat', { receiverUserId, data, receiverName,receiverImage, authToken});
        } else {
            console.error("Receiver user not found");
            res.status(404).json({ error: 'Receiver user not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});


  router.post('/chat/:receiverUserId', async(req,res)=>{
    try{
        const {receiverUserId}= req.params;
        const{message} = req.body;
        const loggedInUserId = req.cookies.authToken;
        io.emit('chat',{senderId:loggedInUserId, receiverUserId, message});   
        // res.status(200).json({message:"message sent succesfully"});
        res.redirect(`/chat/${receiverUserId}`);
    }catch(error){
        console.error(error);
        res.status(500).json({error:"internal server error", details:error.message});
    }
  })

  

  


// router.get('/chat/:receiverUserId', (req, res) => {
//   const { receiverUserId } = req.params;
//   const { loggedInUserId } = userController.getUsersList(req); 
//   res.render("chat", { receiverUserId , loggedInUserId});
// });



  
module.exports = router;