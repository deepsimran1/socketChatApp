const express = require('express');
const cookieParser = require('cookie-parser');
const socketIo = require('socket.io');
const connectDB = require('./config/dbConfig');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = socketIo(server);
const port = 3000;
const messageController = require('./controllers/messageController');
const jwt = require('jsonwebtoken');

var userRouter = require('./routes/user');
var viewRouter = require('./routes/view');


connectDB();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));


app.use('/user', userRouter);
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

const onlineUsers={};

io.on('connect', (socket) => {
  console.log(`User connected: ${socket.id}`);

 

  const userId = socket.id;
  onlineUsers[userId] = true;
  io.emit('updateOnlineUsers', Object.keys(onlineUsers));
  console.log('onlieusers:', onlineUsers);

  socket.on('chat', async (data) => {
    console.log('data', data)
    try {
      const { receiverUserId, message } = data;
      console.log("Emitted cht data:", data);
      socket.emit('message', data);
      socket.to(receiverUserId).emit('chat', data);
      
      const result = await messageController.chat(socket.id, receiverUserId, message);
      socket.emit('messageSent', { senderId: socket.id, receiverUserId, message, conversationId: result.conversationId });

    } catch (error) {
      console.error(error);
    }
    console.log("data", data);
  });

  socket.on('checkOnlineStatus', (data) => {
    const { receiverUserId } = data;
    const isOnline = onlineUsers[receiverUserId] || false;
    socket.emit('updateOnlineStatus', isOnline);
  });


  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    onlineUsers[userId] = false;
    io.emit('updateOnlineUsers', Object.keys(onlineUsers));
  });
});



server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = {app, io};