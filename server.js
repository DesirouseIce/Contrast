let playerCnt = 0;

const express = require('express');

const app = express();
const server = app.listen(process.env.PORT || 3000);

app.use(express.static('public'));

const socket = require('socket.io');

const io = socket(server);

console.log('server is running');

io.sockets.on('connection', newConnection);

function newConnection(socket){
  console.log('new connection: ' + socket.id);
  playerCnt++;
  console.log('number of players: ' + playerCnt);

  socket.on('dissconnect', dissconnection);

  function dissconnection(socket){
    console.log('someone disconnected');
    playerCnt--;
    console.log('number of players: ' + playerCnt);
  }

  socket.on('pingg', function(){
    socket.emit('pongg');
  });

  socket.on('sendPos', posMsg);

  function posMsg(data) {
    socket.broadcast.emit('playerPos', data, playerCnt);
  }
}
function useless(){
}