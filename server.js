let players = [];
let playersPos = [];

const express = require('express');

const app = express();
const server = app.listen(process.env.PORT || 3000);

app.use(express.static('public'));

const socket = require('socket.io');

setInterval(function(){
  getConnectedSockets().forEach(function(socket) {
    socket.disconnect(true);
  });
  players = [];
  playersPos = [];
  

const io = socket(server);

console.log('server is running');

io.sockets.on('connection', newConnection);

function newConnection(socket){
  players.push(socket.id);
  playersPos.push();

  socket.on('dissconnect', dissconnection);

  function dissconnection(socket){
    
  }

  socket.on('pingg', function(){
    socket.emit('pongg');
  });

  socket.on('sendPos', updatePos);

  function updatePos(myPos) {
    for (let i = 0; i < players.length; i++){
      if(players[i] == socket.id){
        playersPos[i]
    //socket.broadcast.emit('playerPos', data, playerCnt);
  }
}

function getConnectedSockets() {
  return Object.values(io.of("/").connected);
}
