const Message = require("./../models/message");
const jwt = require("jsonwebtoken");
const io = require('../app');
const messageController = {
  chat: async (senderId, receiverId, message) => {
    try {
      const conversationId = `${senderId}_${receiverId}_${Date.now()}`;

      // const files = req.files;

      // let newMessage;
      // if (files && files.length > 0 && message) {
      //   newMessage = new Message({
      //     sender: senderId,
      //     receiver: receiverId,
      //     message: [...files.map((file) => file.path), message],
      //     conversationId: conversationId,
      //   });
      // } else if (files && files.length > 0) {
      //   newMessage = new Message({
      //     sender: senderId,
      //     receiver: receiverId,
      //     message: files.map((file) => file.path),
      //     conversationId: conversationId,
      //   });
      // } else {
        const newMessage = new Message({
          sender: senderId,
          receiver: receiverId,
          message: message,
          conversationId: conversationId,
        });
      // }

      await newMessage.save();
    
      
      return { senderId, receiverId, message, conversationId };
      
      // res.status(201).json({message: "Message sent successfully",conversationId: conversationId,});
    } catch (error) {
      console.error(error);
      // res.status(500).json({ error: "Internal server error", details: error.message });
    }
  },


 getConversation: async (req, res) => {
  const token = req.cookies.authToken;
  try {
    const decodedToken = jwt.verify(token, "abc");
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

    return { conversation: messages };
  } catch (error) {
    console.error(error);
    return error;
  }
},

 



};

module.exports = messageController;
