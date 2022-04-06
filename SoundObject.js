//let carrier, this.modulator, env;
class SoundObject {
  constructor(
    xPos,
    yPos,
    diameter,
    speedX,
    speedY,
    colorValue1,
    colorValue2,
    colorValue3
  ) {
    this.xPos = xPos;
    this.yPos = xPos;
    this.diameter = diameter;
    this.speedX = speedX;
    this.speedY = speedY;
    this.isPlaying = false;
    //Options for envelope, not implemented yet
    //this.t1 = 1.1; // attack time in seconds
    //this.l1 = 1.0; // attack level 0.0 to 1.0
    //this.t2 = 1.3; // decay time in seconds
    //this.l2 = 0.9; // decay level  0.0 to 1.0
    this.carrier = new p5.Oscillator("square");
    this.modulator1 = new p5.Oscillator("Sine");
    this.delay = new p5.Delay();
    this.glideSound = new Array(10);
    this.tonePitch = 0;
    //this.env = new p5.Envelope(t1, l1, t2, l2);
    this.alpha = 170;
    this.objectGrabbed = false;
    this.userCollision;
    this.isLocked = false;
    this.delayTime = 0;
    this.divideOctMultiplier = Math.pow(2, 1 / 12);
    this.baseFrequency = 440;
    this.k = 0;
    this.j = 0;
  }

  move() {
    let leftWristScreenX = map(poses[0].pose.leftWrist.x, 0, 640, 0, width);
    let leftWristScreenY = map(poses[0].pose.leftWrist.y, 0, 360, 0, height);
    let rightWristScreenX = map(poses[0].pose.rightWrist.x, 0, 640, 0, width);
    let rightWristScreenY = map(poses[0].pose.rightWrist.y, 0, 360, 0, height);
    //let grabColliderExpansion = 100;
    //if both hands are in a certain relative area close to the soundobject, it becomes movable.
    if (
      //this is the old "grab with two hands - method"
      /*rightWristScreenX > this.xPos - grabColliderExpansion &&
      rightWristScreenX < this.xPos + grabColliderExpansion + this.diameter &&
      rightWristScreenY > this.yPos - grabColliderExpansion &&
      rightWristScreenY < this.yPos + grabColliderExpansion + this.diameter &&
      leftWristScreenX > this.xPos - grabColliderExpansion &&
      leftWristScreenX < this.xPos + grabColliderExpansion + this.diameter &&
      leftWristScreenY > this.yPos - grabColliderExpansion &&
      leftWristScreenY < this.yPos + grabColliderExpansion + this.diameter*/

      //new method: One Handed Move after two hands grab for smoother moving
      //3 Steps:
      //1. Step: Place both hands on Soundobject, see upper conditions
      //2. Step: make a boolean which stores information about both hands touched.
      //         if so, attach object to coordinates of left hand
      //3. Step: Place right hand on Soundobject again to "drop" it

      rightWristScreenX > this.xPos - grabColliderExpansion &&
      rightWristScreenX < this.xPos + grabColliderExpansion + this.diameter &&
      rightWristScreenY > this.yPos - grabColliderExpansion &&
      rightWristScreenY < this.yPos + grabColliderExpansion + this.diameter &&
      leftWristScreenX > this.xPos - grabColliderExpansion &&
      leftWristScreenX < this.xPos + grabColliderExpansion + this.diameter &&
      leftWristScreenY > this.yPos - grabColliderExpansion &&
      leftWristScreenY < this.yPos + grabColliderExpansion + this.diameter
    ) {
      this.objectGrabbed = true;
      //visual soundobject-in-use-feedback
      if (this.alpha < 255) {
        this.alpha = this.alpha + 10;
      }
    }
    //visual soundobject-not-in-use-anymore-feedback
    else {
      if (this.alpha > 170) {
        this.alpha = this.alpha - 10;
      }
    }
    //this puts the soundobject onto the position of the left hand.
    if (this.objectGrabbed) {
      this.xPos = leftWristScreenX;
      this.yPos = leftWristScreenY;
    }
    if (this.objectGrabbed && rightWristScreenY > height - 50) {
      this.objectGrabbed = false;
    }
  }
  /* lockObject() {
    if (
      rightWristScreenX > width - 50 &&
      rightWristScreenY > 100 &&
      rightWristScreenY < height - 100
    ) {
    }
  }*/
  checkEdges() {
    if (this.x > width || this.x < 0) {
      this.speedX = -this.speedX;
    }

    if (this.y > height || this.y < 0) {
      this.speedY = -this.speedY;
    }
  }

  checkUserCollision() {
    if (
      map(poses[0].pose.rightWrist.x, 0, 640, 0, width) > this.xPos &&
      map(poses[0].pose.rightWrist.x, 0, 640, 0, width) <
        this.xPos + this.diameter &&
      map(poses[0].pose.rightWrist.y, 0, 360, 0, height) > this.yPos &&
      map(poses[0].pose.rightWrist.y, 0, 360, 0, height) <
        this.yPos + this.diameter
    ) {
      fill(0, 0, 255);
      ellipse(this.xPos, this.yPos, this.diameter + 10);
      this.userCollision = true;
      //print("collision");
    } else {
      this.userCollision = false;
    }
  }

  playSound() {
    //carrier = new p5.Oscillator("square"); //PROBLEM: THIS CREATES ONE NEW OBJECT PER FRAME. CANT BE TURNED OFF SINCE REFERENCE IS MISSING AS SOON AS NEW FRAME IS CALLED!!!!
    //carrier.amp(0); // set amplitude
    //Fills glide Buffer with 10 Values// STILL BUGGY AND NOT RLY EFFECTIVE
    if (this.glideSound.length < 9) {
      for (let i = 0; i <= 9; i++) {
        this.glideSound = leftWristScreenY;
      }
    }
    //If buffer is full, add one Value at the beginning remove one at the end.
    else {
      this.glideSound.unshift(leftWristScreenY);
      this.tonePitch = this.glideSound.pop();
    }
    //console.log(this.glideSound);
    if (leftWristScreenY < this.tonePitch) {
      this.tonePitch = this.tonePitch - 1;
    } else {
      this.tonePitch = this.tonePitch + 1;
    }
    //Try go get tonal scale
    for (let i = 1; i < 12; i++) {
      if (
        leftWristScreenY > height - ((i + 1) * height) / 12 &&
        leftWristScreenY < height - (i * height) / 12
      ) {
        this.k = i;
      }
    }
    while (this.j < this.k) {
      this.baseFrequency = this.baseFrequency * this.divideOctMultiplier;
      this.j++;
    }
    this.k = 0;
    this.j = 0;
    this.currentFrequency = this.baseFrequency;
    this.baseFrequency = 440;
    this.carrier.freq(this.currentFrequency);

    /*
    carrier = new p5.Oscillator("square");
    carrier.amp(0); // set amplitude
    carrier.freq(220); // set frequency
    */
    //this.modulator1.disconnect();
    //this.modulator1.amp(1);
    //this.modulator1.freq(1);
    /*
    this.modulator2 = new p5.Oscillator("triangle");
    this.modulator2.disconnect();
    this.modulator2.start();
    this.modulator2.amp(1);
    this.modulator2.freq(1);
    this.modulator3 = new p5.Oscillator("triangle");
    this.modulator3.disconnect();
    this.modulator3.start();
    this.modulator3.amp(1);
    this.modulator3.freq(1);
    */
    //env = new p5.Envelope(t1, l1, t2, l2);
    // this.modulator's default amplitude range is -1 to 1.
    // Multiply it by -200, so the range is -200 to 200
    // then add 220 so the range is 20 to 420
    //carrier.freq(this.modulator2.mult(-400).add(220));
    //carrier.freq(this.modulator3.mult(-400).add(220));

    if (this.userCollision) {
      if (!this.isPlaying) {
        //userStartAudio();
        this.carrier.start();
        //this.modulator1.start();
        this.carrier.amp(1.0);
        //this.carrier.freq(this.modulator1.mult(-400).add(220));
        //this.modulator1.amp(1);
        //this.modulator1.freq(1);

        this.isPlaying = true;
        //env.play(carrier);
        //print("is playing");
      } else {
        //print("keep playing");
      }
    } else {
      //carrier.amp(0.1);
      this.carrier.stop();
      //this.modulator1.stop();
      this.isPlaying = false;
      //print("is not playing");
    }
    //WARNING: SOME BROWSERS LIMIT DELAYTIME TO 1 SECOND->Causes crash
    this.delayTime = leftWristScreenX / 1000;
    if (this.delayTime >= 1) {
      this.delayTime = 0.9999;
    }
    this.feedback = mouseY / 1000;
    if (this.feedback>=1){
      this.feedback = 0.9999
    }
      if (this.delayTime >= 1) {
      this.delayTime = 0.9999;
    }
    this.delay.process(this.carrier, this.delayTime, this.feedback);
    //print("leftWri/1000:",this.delayTime, "mouseY/1000: ", mouseY/1000);
  }

  displayText() {
    if (this.userCollision) {
      text(
        "SoundObject1",
        poses[0].pose.rightWrist.x,
        poses[0].pose.rightWrist.y,
        50,
        50
      );
    }
  }

  colorize() {
    this.colorValue1 = floor(this.xPos) / 4;
    this.colorValue2 = floor(this.yPos) / 4;
    this.colorValue3 = floor(this.yPos) / 4;
    //print("color value: " + this.colorValue1);
    //print("color value: " + this.colorValue2);
  }

  display() {
    noStroke();
    fill(this.colorValue1, this.colorValue2, this.colorValue3, this.alpha);
    ellipse(this.xPos, this.yPos, this.diameter);
    line(0, 300, width, 400);
    stroke(100);
  }
}
