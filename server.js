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
}, 86400000);
  

const io = socket(server);

console.log('server is running');

io.sockets.on('connection', newConnection);

function newConnection(socket){
  players.push(socket.id);
  playersPos.push();

  socket.on('dissconnect', dissconnection);

  function dissconnection(socket){
    for (let i = 0; i < players.length; i ++){
      if(players[i] == socket.id){
        players.splice(i, 1);
        playersPos.splice(i * 3, 3);
      }
    }      
  }

  socket.on('pingg', function(){
    socket.emit('pongg');
  });

  socket.on('sendPos', updatePos);

  function updatePos(myPos) {
    for (let i = 0; i < players.length; i++){
      if(players[i] == socket.id){
        if (playersPos.length != players.length * 3){
          splice(playersPos, myPos.x, i * 3);
          splice(playersPos, myPos.y, (i * 3) + 1);
          splice(playersPos, myPos.heading, (i * 3) + 2);
        }
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
