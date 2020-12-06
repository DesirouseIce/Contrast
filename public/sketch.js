let walls = [];
let ray;
let particle;
let xoff = 0;
let yoff = 10000;
let inactivityTimer;
let reconnectMsg = false;

const sceneH = 720;
const sceneW = 1280;
let sliderFOV;
let sliderRayAngle;

let players = [];
let playersPos = [];
let renderPlayers = [];
let shootObjects = [];

var socket;
var startTime;
var latency = 0;
let fr = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);

  socket = io.connect('/');
  socket.on('receivePos', recivePos);
  
  socket.on('hit', function(){
    console.log('died');
    particle.respawn(sceneW, sceneH);
  });

  setInterval(function(){
    startTime = Date.now();
    socket.emit('pingg');
  }, 2000);
  setInterval(function(){
    fr = frameRate();
  }, 500);

  socket.on('pongg', function(){
    latency = Date.now() - startTime;
  });

  let x1;
  let x2;
  let y1;
  let y2;
  for (let i = 0; i < 6; i++){
    switch(i){
      case 1:
        x1 = ((sceneW/7)+((2.5*sceneW))/7);
        x2 = ((sceneW/7)+((3.5*sceneW))/7);
        y1 = ((sceneH/7)+((3.5*sceneH))/7);
        y2 = ((sceneH/7)+((2.5*sceneH))/7);
        break;
      case 2:
        x1 = ((sceneW/7)+((5.5*sceneW))/7);
        x2 = ((sceneW/7)+((4.5*sceneW))/7);
        y1 = ((sceneH/7)+((3.5*sceneH))/7);
        y2 = ((sceneH/7)+((2.5*sceneH))/7);
        break;
      case 3:
        x1 = ((sceneW/7)+((4*sceneW))/7);
        x2 = ((sceneW/7)+((4*sceneW))/7);
        y1 = ((sceneH/7)+((3*sceneH))/7);
        y2 = ((sceneH/7)+((5*sceneH))/7);
        break;
      case 4:
        x1 = ((sceneW/7)+((2.5*sceneW))/7);
        x2 = ((sceneW/7)+((3.5*sceneW))/7);
        y1 = ((sceneH/7)+((4.5*sceneH))/7);
        y2 = ((sceneH/7)+((5.5*sceneH))/7);
        break;
      case 5:
        x1 = ((sceneW/7)+((4.5*sceneW))/7);
        x2 = ((sceneW/7)+((5.5*sceneW))/7);
        y1 = ((sceneH/7)+((5.5*sceneH))/7);
        y2 = ((sceneH/7)+((4.5*sceneH))/7);
        break;
    }
    walls[i] = new Boundary(x1 * 1.5 - 650, y1 * 1.5 - 400, x2 * 1.5 - 650, y2 * 1.5 - 400);
  }
  walls.push(new Boundary(0, 0, sceneW, 0));
  walls.push(new Boundary(sceneW, 0, sceneW, sceneH));
  walls.push(new Boundary(sceneW, sceneH, 0, sceneH));
  walls.push(new Boundary(0, sceneH, 0, 0));
  particle = new Particle(sceneW, sceneH);
  // sliderFOV = createSlider(60, 120, 80, 5);
  // sliderFOV.input(changeFOV);
  // sliderRayAngle = createSlider(5, 40, 10, 2);
  // sliderRayAngle.input(changeRayAngle);
}

function recivePos(data) {
  players = data.players;
  playersPos = data.playersPos;
  renderPlayers = [];
  
  for (let i = 0; i < playersPos.length; i += 3){
    if (playersPos[i] != particle.pos.x && playersPos[i] != particle.pos.y){
      let x = 3 * cos(playersPos[i + 2] + radians(90));
      let y = 3 * sin(playersPos[i + 2] + radians(90));
      renderPlayers.push(new Boundary(playersPos[i] + x, playersPos[i + 1] + y, playersPos[i] - x, playersPos[i + 1] - y));
    }
  }
}

function changeFOV(){
  const fov = /*sliderFOV.value()*/90;
  particle.updateFOV(fov);
}

function changeRayAngle(){
  //const rAngle = /*sliderRayAngle.value()*/0.1;
  //particle.updateRayAngle(rAngle);
}

function keyPressed() {
  if (key == 'f'){
    fullscreen(1);
    resizeCanvas(displayWidth, displayHeight);
  } else if (keyCode == UP_ARROW){
    shootObjects = walls;
    shootObjects.push(renderPlayers);
    const hitPlayer = particle.shoot(shootObjects, players, renderPlayers);
    console.log(hitPlayer);
    if (hitPlayer != 'noHit'){
      for (let player of players){
        if (players[player] == hitPlayer){
          socket.emit('hitPlayer', hitPlayer);
          console.log('shot ' + hitPlayer);
        }
      }
    }
  }
}

function draw() {
  if (walls.length > 9){
    walls.splice(10, walls.length - 9);
  }
  
  var myPos = {
    x: particle.pos.x,
    y: particle.pos.y,
    heading: particle.heading
  }
  var socketID = {
    ID: socket.id
  }

  socket.emit('sendPos', myPos);

  if (keyIsDown(LEFT_ARROW)){
    particle.rotate(-0.05);
  } else if (keyIsDown(RIGHT_ARROW)){
    particle.rotate(0.05);
  }
  if (keyIsDown(87)){
    particle.move(3, walls);
  } else if (keyIsDown(83)){
    particle.move(-3, walls);
  }
  if (keyIsDown(65)){
    particle.strafe(-3, walls);
  } else if (keyIsDown(68)){
    particle.strafe(3, walls);
  }

  if (!focused){
    inactivityTimer++;
  } else if (inactivityTimer != 3000){
    inactivityTimer = 0;
  }
  
  if (inactivityTimer > 300 && inactivityTimer != 3000){ 
    console.log('disconnecting');
    socket.emit('dissconnect', socketID);
    inactivityTimer = 3000;
    reconnectMsg = true;
  }

  background(0);
    // for(let wall of walls){  // - shows walls for 2d map
    //   wall.show();           // -
    // }                        // -
   //particle.update(noise(xoff) * width/2, noise(yoff) * height); // - automatic movement
   //particle.update(mouseX, mouseY); // - mousecontrolled movement for 2d map
   //particle.show(); // - particle display for 2d map
   //xoff += 0.01;
   //yoff += 0.01;
  
  let scene = (particle.look(walls));
  let w = width / scene.length;
  push();
  translate(0, 0);
  for (let i = 0; i < scene.length; i++){
    noStroke();
    const sq = scene[i] * scene[i];
    const wSq = width * width;
    const b = map(sq, 0, wSq, 255, 0);
    //const h = map(scene[i], 0, sceneW, sceneH, 0); // - original height mapping
    const h = (10000 / scene[i]); // - prefered height mapping
    fill(b);
    rectMode(CENTER);
    rect(i * w + w / 2, height / 2, w + 1, h);
  }

  scene = (particle.look(renderPlayers));
  w = width / scene.length;
  for (let i = 0; i < scene.length; i++){
    noStroke();
    const sq = scene[i] * scene[i];
    const wSq = width * width;
    const b = map(sq, 0, wSq, 50, 255);
    const h = (10000 / scene[i]);
    fill(b);
    rectMode(CENTER);
    rect(i * w + w / 2, height / 2, w + 1, h);
  }
  pop();
  
  fill(255);
  push();
  stroke(0);
  strokeWeight(5);
  text("fps: " + round(fr), 10, 20);
  text(round(latency) + 'ms', 10, 40);
  text("X: " + round(particle.pos.x), 10, 60);
  text("Y: " + round(particle.pos.y), 10, 80);
  if (reconnectMsg){
    text('Disconnected due to inactivity, to reconnect refresh the page', width/4, height/2);
    socket.close();
  }
  pop();
}
