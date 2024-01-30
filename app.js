const express = require('express');
const cookieParser = require('cookie-parser');
const socketIo = require('socket.io');
const connectDB = require('./config/dbConfig');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = socketIo(server);
const port = 3000;
const jwt = require('jsonwebtoken');
const Message = require('./models/message');

var viewRouter = require('./routes/routes');


connectDB();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));



app.use('/', viewRouter);


io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decodedToken = jwt.verify(token, "abc");
      socket.id = decodedToken.userId;
      next();
    } catch (error) {
      console.error(error);
      next(new Error('Authentication error'));
    }
  } else {
    next(new Error('Authentication error'));
  }
});

const onlineUsers = {};

io.on('connect', (socket) => {
  
  onlineUsers[socket.id] = true;
  io.sockets.emit('userOnline',Object.keys(onlineUsers));
  // io.emit('userOnline',Object.keys(onlineUsers));
  console.log(`User connected: ${socket.id}`);
  console.log('onlineusers', onlineUsers);

  

  socket.on('chat', async (data) => {
    console.log('data', data)
    try {
      const { receiverUserId, message } = data;
      console.log("Emitted cht data:", data);

      const conversationId = `${socket.id}_${receiverUserId}_${Date.now()}`;

      const newMessage = new Message({
        sender: socket.id,
        receiver: receiverUserId,
        message: message,
        conversationId: conversationId,
      });
      await newMessage.save();
      
      
      socket.to(receiverUserId).emit('chat', data);
      

      socket.emit('messageSent', { senderId: socket.id, receiverUserId, message, conversationId });

    } catch (error) {
      console.error(error);
    }
    console.log("data", data);
  });

 


  socket.on('disconnect', () => {
    delete onlineUsers[socket.id];
    io.sockets.emit('userOnline',Object.keys(onlineUsers));
    console.log(`User disconnected: ${socket.id}`);
    console.log('onlineusers', onlineUsers);
    
  });
});



server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = {app, io};