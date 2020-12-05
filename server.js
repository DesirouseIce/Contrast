let players = [];
let playersPos = [];
let disPlayers = [];

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
   disPlayers = []; 
   getConnectedSockets().forEach(function(socket) {
     disPlayers.push(socket.id);
   });
   if (disPlayers.length != players.length){
    console.log('someone(s) disconnected');
    console.log(players);
   }
   players = disPlayers;
 }, 2000);

const io = socket(server);

console.log('server is running');

io.sockets.on('connection', newConnection);

function newConnection(socket){
  players.push(socket.id);
  playersPos.push(0, 0, 0);

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
