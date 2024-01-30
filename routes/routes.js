const express = require("express");
const router = express.Router();
const multer = require("multer");
const Message = require('../models/message');
const User = require('../models/user');
const io = require('../app');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


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
      const image = req.file;
      const existing = await User.findOne({ userId });
      if (existing) {
        return res
          .status(409)
          .json({ success: false, message: "User already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        userId,
        userName,
        password: hashedPassword,
        phoneNumber,
        image: image.path,
      });

    
      await user.save();
      res.redirect("/login");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server Error", details: error.message });
    }
  });


  router.get('/login', async(req,res)=>{
    res.render("login");
  });

  router.post("/login", async(req,res)=> {
    try{
      console.log("Received request body: ",req.body);
  
      
      const { userId, password } = req.body;
      const user = await User.findOne({ userId });
      if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign(
          { userId: user.userId, userName: user.userName },
          "abc",
          {
            expiresIn: "24h",
          }
        );
        console.log("token:", token);
        res.cookie("authToken", token, {httpOnly: true});
        res.redirect('/userList');
        
      } else{
        res.status(401).json({error: 'Unauthorized', details:'Invalid credentials' });
      }
    }catch(error){
      console.error(error);
      res.status(500).json({error: 'Internal Server Error', details:error.message});
    }
  });



  router.get('/userList', async (req, res) => {
    try {
      
      const token = req.cookies.authToken;
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
        // const onlineUsers = res.locals.onlineUsers ;
        // console.log("online", onlineUsers);
      data = users;
      console.log("data",data);
      res.render("userData", { data,authToken:token});
     
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  });



  router.get('/chat/:receiverUserId', async (req, res) => {
    const { receiverUserId } = req.params;
    const authToken = req.cookies.authToken;
    try {
      const decodedToken = jwt.verify(authToken, "abc");
      const receiver = req.params.receiverUserId;
      const senderId = decodedToken.userId;
      const messages = await Message.aggregate([
        {
          $match: {
            $or: [
              { sender: senderId, receiver: receiver },
              { sender: receiver, receiver: senderId },
            ],
          },
        },
        {
          $sort: { createdAt: 1 },
        },
        {
          $project: {
            _id: 0,
            senderId: "$sender",
            receiverId: "$receiver",
            message: "$message",
            date_time: {
              $dateToString: {
                format: "%H:%M",
                date: "$createdAt",
              },
            },
  
          },
        },
      ]);
      const data = messages;
        console.log("data", data);
        const receiverUser = await User.findOne({ userId: receiverUserId });

        
        if (receiverUser) {
            const receiverName = receiverUser.userName;
            const receiverImage = receiverUser.image;
            console.log("rceievrimage", receiverImage);
            res.render('chat', { receiverUserId, data, receiverName ,receiverImage, authToken});
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
       
        res.redirect(`/chat/${receiverUserId}`);
    }catch(error){
        console.error(error);
        res.status(500).json({error:"internal server error", details:error.message});
    }
  })

  

  






  
module.exports = router;