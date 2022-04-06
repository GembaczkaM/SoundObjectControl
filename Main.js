//Ideas:
//Change sound by moving the sound Object
//Choose SoundObject by moving left hand into closer collider
//Create more than one SoundObject during runtime(Button with //collider)
//After choosing Soundobject change Shape of sound by moving //Object into certain area and then use ur hands for gestures

/*Description "SoundObjectControl":
This is a prototype to test the abilities of p5.js and positionTracking.js to build a gesture-controlled synthesizer.
At first, a "Soundobject" is created, which can be played with the right hand moving over it. It also can be moved by putting both hands in the "grabCollider". The "Object" is now attached to the left hand and can be dragged around. To drop the "Object" the right hand has to be moved to the lower edge of the screen.
While playing the "Object" with the right hand, the left hand can be moved up and down to change the "Objects" pitch in a tonal scale. "MouseY" increases Feedback and "lefthandY" increases time of the delay-effect, which is beeing attached to it from the start.
There is also a possibility to create new objects, which have the same properties as the first one. To create a new object place your right hand in the top right corner of the screen and your left hand in the lower left corner.
Issues: 
-when grabbing one object in the range of another, both will be grabbed and cant be divided anymore.
-the refresh rate of positionTracking and the consistency of correct identification of the wrist is not sufficient to provide a clean change of pitch or constant playing.
*/

let sound = [];
let SoundObject1;
let soundNumber;
let prevSoundNumber;
let rightWristScreenX;
let rightWristScreenY;
let leftWristScreenX;
let leftWristScreenY;
let createNew = false;
let createNext = true;
let soundObjects=[];
let grabColliderExpansion = 100;
let isCreated = false;
let isGrabbedBorder = 0;

function setup() {
  isGrabbedBorder = height/2;
  canvas = createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(width, height);
  pose_layer = createGraphics(canvas.width, canvas.height);
  // setup poseNet tracking in in positionTracking.js
  poseNetSetup();
  SoundObject1 = new SoundObject(300, 200, 40, 0, 0, 0, 255, 0);
}

function draw() {
  //print(leftWristScreenX)
  background(240, 240, 240);
  push();
  translate(width, 0); // move to far corner
  scale(-1.0, 1.0); // flip x-axis backwards
  //video on canvas, position, dimensions
  image(video, 0, 0, width, height);
  pop();
  // checking if poseNet has found any 'poses'
  if (poses.length > 0) {
    pose_layer.clear();

  //map wrist-position to the screensize
    rightWristScreenX = map(poses[0].pose.rightWrist.x, 0, 640, 0, width, true);
    rightWristScreenY = map(
      poses[0].pose.rightWrist.y,
      0,
      360,
      0,
      height,
      true
    );
    leftWristScreenX = map(poses[0].pose.leftWrist.x, 0, 640, 0, width, true);
    leftWristScreenY = map(poses[0].pose.leftWrist.y, 0, 360, 0, height, true);
    pose_layer.noStroke();
    pose_layer.fill(200, 0, 0);
    // drawing the rightWrist
    pose_layer.ellipse(rightWristScreenX, rightWristScreenY, 30, 30);
    pose_layer.noStroke();
    pose_layer.fill(0, 190, 80);
    // drawing the lefttWrist
    pose_layer.ellipse(leftWristScreenX, leftWristScreenY, 30, 30);
    //drawSkeleton();
    image(pose_layer, 0, 0);
    //Calling "Soundobject1" methods
    SoundObject1.move();
    SoundObject1.checkUserCollision();
    SoundObject1.displayText();
    SoundObject1.colorize();
    SoundObject1.display();
    SoundObject1.playSound();
    //create new Soundobject with wrists in opposite corners
    if (
      leftWristScreenX < 200 &&
      leftWristScreenY > height - 200 &&
      rightWristScreenX > width - 200 &&
      rightWristScreenY < 200 &&
      createNext
    ) {
      createNew = true;
    }
    if (createNext&&createNew) {
      soundObjects.push(new SoundObject(400, 200, 40, 0, 0, 0, 255, 0));
      createNext = false;
      isCreated = true;
    }
    //This is to solve the problem of creating one Soundobject per frame
    //With this there is only one Soundobject created when executing the gesture
     if(
      leftWristScreenX > 200 ||
      leftWristScreenY < height - 200 ||
      rightWristScreenX < width - 200 ||
      rightWristScreenY > 200
       )
       {
       createNext = true;
       createNew = false;
       }
    if (isCreated) {
      for (let Object in soundObjects) {
        soundObjects[Object].move();
        soundObjects[Object].checkUserCollision();
        soundObjects[Object].displayText();
        soundObjects[Object].colorize();
        soundObjects[Object].display();
        soundObjects[Object].playSound();
      }
    }
  }
}
//STACKING OBJECTS NEEDS TO BE UNDOABLE
//REVOVING OBJECTS NEEDS TO BE IMPLEMENTED