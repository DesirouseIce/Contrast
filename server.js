console.log('server is starting...');

let players = [];
let playersPos = [];
// let disPlayers = [];

const express = require('express');

const app = express();
const server = app.listen(process.env.PORT || 3000);

app.use(express.static('public'));

const socket = require('socket.io');
const io = socket(server);

setInterval(function(){
  console.log('server is rebooting...');
  io.sockets.disconnect();
  players = [];
  playersPos = [];
  console.log('server has rebooted');
}, 86400000);

console.log('server is running');

io.sockets.on('connection', newConnection);

function newConnection(socket){
  players.push(socket.id);
  playersPos.push(0, 0, 0);
  console.log(players);

  socket.on('pingg', function(){
    socket.emit('pongg');
  });
  
  if (socket.connected() == false){
    for (i = 0; i < players; i++){
      if (players[i] == socket.id){
        console.log(players[i] + ' disconnected');
        players.splice(i, 1);
        playersPos.splice(i * 3, 3);
        console.log(players);
      }
    }
  }
  
  socket.on('hitPlayer', function(hitPlayer){
    io.to(hitPlayer).emit('hit');
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
