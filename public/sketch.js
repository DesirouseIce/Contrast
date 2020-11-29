let walls = [];
let ray;
let particle;
let xoff = 0;
let yoff = 10000;
let players = [];
let inactivityTimer;
let xLogged;
let yLogged;
let headingLogged;
let renderObjects = [];
let reconnectMsg = false;

const sceneH = 720 * 1.5;
const sceneW = 1280 * 1.5;
let sliderFOV;
let sliderRayAngle;

var socket;
var startTime;
var latency = 0;
let fr = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);

  socket = io.connect('/');
  socket.on('playerPos', recivePos);

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
    walls[i] = new Boundary(x1 - 740, y1 - 410, x2 - 740, y2 - 410);
  }
  walls.push(new Boundary(0, 0, width, 0));
  walls.push(new Boundary(width, 0, width, height));
  walls.push(new Boundary(width, height, 0, height));
  walls.push(new Boundary(0, height, 0, 0));
  particle = new Particle();
  // sliderFOV = createSlider(60, 120, 80, 5);
  // sliderFOV.input(changeFOV);
  // sliderRayAngle = createSlider(5, 40, 10, 2);
  // sliderRayAngle.input(changeRayAngle);
}

function recivePos(data, playerCnt) {
  if (players.length > playerCnt) players = [];
  x = 3 * cos(data.heading);
  y = 3 * sin(data.heading);
  players.push(new Boundary(x + (data.x - 3), y, x + (data.x + 3), y));
  x1 = x+(data.x - 3);
  y1 = y+(data.y);
  console.log('x: ' + x1);
  console.log('y: ' + y1);
  console.log('heading: ' + data.heading);
}

function changeFOV(){
  const fov = /*sliderFOV.value()*/90;
  particle.updateFOV(fov);
}

function changeRayAngle(){
  //const rAngle = /*sliderRayAngle.value()*/0.1;
  //particle.updateRayAngle(rAngle);
}

function draw() {

  var data = {
    x: particle.pos.x,
    y: particle.pos.y,
    heading: particle.heading
  }

  socket.emit('sendPos', data);

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
  
    if (key == "f"){
      fullscreen(1);
      resizeCanvas(displayWidth, displayHeight);
    }

  if (particle.pos.x == xLogged && particle.pos.y == yLogged && particle.heading == headingLogged && inactivityTimer != 3000){
    inactivityTimer++;
  } else if (particle.pos.x != xLogged || particle.pos.y != yLogged || particle.heading != headingLogged || inactivityTimer != 3000){
    inactivityTimer = 0;
    xLogged = particle.pos.x;
    yLogged = particle.pos.y;
    headingLogged = particle.heading;
  }
  
  if (inactivityTimer > 2500 && inactivityTimer != 3000){ 
    console.log('disconnecting');
    socket.emit('dissconnect');
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
  const w = width / scene.length;
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

  scene = (particle.look(players));
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
