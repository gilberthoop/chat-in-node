var socket = io();

socket.on('connect', function () {
  console.log('Connected to server'); 
});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

// Client listens for a new message from the server
socket.on('newMessage', function (message) {
  console.log('newMessage', message);
});
