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
  // Display the message in the DOM
  var li = jQuery('<li></li>');
  li.text(`${message.from}: ${message.text}`);

  jQuery('#messages').append(li);
});

// Emit the create message event when the submit button is clicked
jQuery('#message-form').on('submit', function(event) {
  event.preventDefault();

  socket.emit('createMessage', {
    from: 'User',
    text: jQuery('[name=message]').val()
  }, function () {
    jQuery('[name=message]').val('');
  });
});
