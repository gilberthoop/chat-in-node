const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io'); 

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New user connected');

  // Server listens for a join event
  socket.on('join', (params, callback) => {
    // Check if login params are empty or invalid
    if (!isRealString(params.name)) {
      return callback('Name and room name are required.');
    }

    /*
     * When users join a room, remove them from previous rooms
     * and add them to the new room
     */
    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    // Update the user list in the room, and send a welcome message
    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
    callback();
  });
  
  /*
   * Server listens for a create message event from the client
   * and emits that message event back to all users
   */
  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);
    
    // Check if the user exists and if the message is not empty
    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    } 
    
    callback();
  });

  /*
   * Server listens for message event containing the location of the user
   * Emits the location to all users
   */
  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);

    // Check if the user exists
    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
    }
  });

  /*
   * When users leave the room, remove them from the room
   * Emit a message,
   * And update the user list 
   */
  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);
    
    if (user) {
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
    }
  });
});


server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
