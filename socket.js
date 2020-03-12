var app = require('express')();
var server = app.listen(3001);
// var server = require('http').Server(app);
// var io = require('socket.io')(server);
var io = require('socket.io').listen(server);

// server.listen(3001);
console.log('ok')

io.on('connection',function(socket) {
  socket.emit('news',{ 'hello':'world' });
  socket.on('my other event',function(data) { console .log(data) })
});
