// io.use((socket, next) => {
//     const token = socket.handshake.auth.token;
//     if (token) {
//       try {
//         const decodedToken = jwt.verify(token, "abc");
//         socket.userId = decodedToken.userId;
//         next();
//       } catch (error) {
//         console.error(error);
//         next(new Error('Authentication error'));
//       }
//     } else {
//       next(new Error('Authentication error'));
//     }
//   });
  
//   // Socket.IO connection event
//   io.on('connection', (socket) => {
//     console.log(`User connected: ${socket.userId}`);
  
//     socket.on('chat', async (data) => {
//       try {
//         const { receiverUserId, message } = data;
//         const result = await messageController.chat(socket.userId, receiverUserId, message);
//         if (result) {
//           io.to(socket.userId).to(receiverUserId).emit('chat', result);
//           console.log("Emitted cht data:", result);
//         }
//       } catch (error) {
//         console.error(error);
//       }
//       console.log("data", data);
//     });
  
//     // socket.on('chat', (data) => {
//     //   const result = 'aaa';
//     //   socket.emit('chat', result);
//     // });
    
  
//     // Handle disconnect event
//     socket.on('disconnect', () => {
//       console.log(`User disconnected: ${socket.userId}`);
//     });
//   });
  












