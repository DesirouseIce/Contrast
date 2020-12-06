class Particle {
  constructor(sceneW, sceneH) {
    this.fov = 90;
    this.rAngle = 0.1; // - ray angle (adjusts the resolution and amt of rays)
    this.spawnloc = [10, sceneW - 10];
    this.pos = createVector(random(this.spawnloc), random(sceneH/2 - 40, sceneH/2 + 40));
    this.rays = [];
    if (this.pos.x > sceneW/2){
      this.heading = PI/1;
    } else this.heading = 0;
    for (let a = -this.fov/2; a < this.fov/2; a += this.rAngle) {                // - set's up rays
      this.rays.push(new Ray(this.pos, radians(a) + this.heading));              // -
    }                                                                            // -
  }
  
  updateFOV(fov){ // - updates the FOV from slider input
    this.fov = fov;
    this.rays = [];
    for (let a = -this.fov/2; a < this.fov/2; a += this.rAngle) {
      this.rays.push(new Ray(this.pos, radians(a)));
    }
  }
  
  updateRayAngle(angle){ // -  updates the ray amt/resolution from slider input
    this.rAngle = angle;
    this.rays = [];
    for (let a = -this.fov/2; a < this.fov/2; a += this.rAngle) {
      this.rays.push(new Ray(this.pos, radians(a) + this.heading));
    }
  }
  
  rotate(angle){    // - rotates veiw left and right
    this.heading += angle;
    let index = 0;
    for (let a = -this.fov/2; a < this.fov/2; a += this.rAngle) {
     this.rays[index].setAngle(radians(a) + this.heading);
      index++;
    }
  }
  
  move(amt, walls){  // - particle/player foward and backward movement
    const vel = p5.Vector.fromAngle(this.heading);
    vel.setMag(amt);
    this.pos.add(vel);
    let collision = false;
    for(let i = 0; i < walls.length; i++){
      if (collideLineCircleVector(walls[i].a, walls[i].b, this.pos, abs(amt))) collision = true;
    }
    if (collision) this.pos.sub(vel);
  }
  
  strafe(amt, walls){ // - particle/player strafe movement
    const vel = p5.Vector.fromAngle(this.heading + radians(90));
    vel.setMag(amt);
    this.pos.add(vel);
    let collision = false;
    for(let i = 0; i < walls.length; i++){
      if (collideLineCircleVector(walls[i].a,walls[i].b,this.pos, abs(amt))) collision = true;
    }
    if (collision) this.pos.sub(vel);
  }
  
  update(x, y){  // - updates position with x and y coords.
    this.pos.set(x, y);
  }

  look(walls) {  // cast's all rays correctly
    const scene = [];
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
      let closest = null;
      let record = Infinity;
      for (let wall of walls){
        const pt = ray.cast(wall);
        if (pt){
          let d = p5.Vector.dist(this.pos, pt);
          const a = ray.dir.heading() - this.heading;  // - calculates diffirent projection method
          d *= cos(a);                                 // -
          if (d < record){
            record = d;
            closest = pt;
          }
        }
      }
//       if (closest){
//         stroke(255, 100);
//         line(this.pos.x, this.pos.y, closest.x, closest.y);
//       }
      scene[i] = record;
    }
    return scene;
  }
  
  shoot(shootObjects, players, renderPlayers) {
    const ray = new Ray(this.pos, this.heading);
    let closest = null;
    let record = Infinity;
    for (let i = 0; i < shootObjects.length; i++){
      console.log(i);
      const pt = ray.cast(shootObjects[i]);
      if (pt){
        let d = p5.Vector.dist(this.pos, pt);
        const a = ray.dir.heading() - this.heading;
        d *= cos(a);
        if (d < record){
          record = d;
          closest = pt;
        }
      }
    }
    let hit = 'noHit';
    for (let i = 0; i < players.length - 1; i++){
      if (collidePointLine(closest.x, closest.y, renderPlayers[i].a.x, renderPlayers[i].a.y, renderPlayers[i].b.x, renderPlayers[i].b.y)){
        hit = players[i];
      }
    }
    return hit;
  }
          
  respawn(sceneW, sceneH){
    this.fov = 90;
    this.rAngle = 0.1; // - ray angle (adjusts the resolution and amt of rays)
    this.spawnloc = [10, sceneW - 10];
    this.pos = createVector(random(this.spawnloc), random(sceneH/2 - 40, sceneH/2 + 40));
    this.rays = [];
    if (this.pos.x > sceneW/2){
      this.heading = PI/1;
    } else this.heading = 0;
    for (let a = -this.fov/2; a < this.fov/2; a += this.rAngle) {                // - set's up rays
      this.rays.push(new Ray(this.pos, radians(a) + this.heading));              // -
    }                                                                            // -
  }

  show() {   // - displays everything for 2d map
    fill(255);
    ellipse(this.pos.x, this.pos.y, 4);
     for (let ray of this.rays) {
       ray.show();
     }
  }
}
