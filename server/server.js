const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io'); 

const {generateMessage} = require('./utils/message');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New user connected');

  // Server emits a welcome message to the users
  socket.emit('newMessage', generateMessage('Admin', 'Welcome to the Node chat app!'));

  // Server broadcasts a message when a new user joined
  socket.broadcast.emit('newMessage', generateMessage('Admin', 'A new user joined!'));

  // Server listens for a create message event from the client
  // and emits that message event back to the users
  socket.on('createMessage', (message, callback) => {
    console.log('createMessage', message);
    io.emit('newMessage', generateMessage(message.from, message.text));
    callback('This is from the server');
  });

  socket.on('disconnect', () => {
    console.log('User was disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
