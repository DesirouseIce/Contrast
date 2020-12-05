let players = [];
let playersPos = [];
let disconnectedPlayers = [];

const express = require('express');

const app = express();
const server = app.listen(process.env.PORT || 3000);

app.use(express.static('public'));

const socket = require('socket.io');

setInterval(function(){
  console.log('server is rebooting...');
  getConnectedSockets().forEach(function(socket) {
    socket.disconnect(true);
  });
  players = [];
  playersPos = [];
  console.log('server has rebooted');
}, 86400000);

setInterval(function(){
  disconnectedPlayers = [];
  getConnectedSockets().forEach(function(socket) {
    disconnectedPlayers.push(socket.id);
  }
  for (let disconnectedPlayer in disconnectedPlayers){
    for (let player in players){
      if(players[player] == disconnectedPlayers[disconnectedPlayer]{
         players.splice(player, 1);
         playersPos.splice(player * 3, 3);
      }
    }
  }
  console.log(disconnectedPlayers + 'have disconnected');
}, 5000);

const io = socket(server);

console.log('server is running');

io.sockets.on('connection', newConnection);

function newConnection(socket){
  players.push(socket.id);
  playersPos.push(0, 0, 0);
  console.log(socket.id + ' has connected');
  console.log(players);

  socket.on('pingg', function(){
    socket.emit('pongg');
  });

  socket.on('sendPos', updatePos);

  function updatePos(myPos) {
    for (let i = 0; i < players.length; i++){
      if(players[i] == socket.id){
        playersPos[i * 3] = myPos.x;
        playersPos[(i * 3) + 1] = myPos.y;
        playersPos[(i * 3) + 2] = myPos.heading;
      }
    }
    var data = {
      players: players,
      playersPos: playersPos
    }
    socket.broadcast.emit('receivePos', data);
  }
}

function getConnectedSockets() {
  return Object.values(io.of("/").connected);
}
