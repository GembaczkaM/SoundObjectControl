let video;
let poseNet;
let poses = [];

function poseNetSetup() {
  video = createCapture(VIDEO);
  video.size(640, 360);

  let options = {
    flipHorizontal: true,
    minConfidence: 1
  };
  
  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, options, modelReady);
  
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on("pose", function (results) {
    // console.log(results);
    poses = results;
  });
  
  // Hide the video element, and just show the canvas
  video.hide();

}

function modelReady() {
  console.log("poseNet model Loaded");
}

function drawSkeleton() {
  
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      if (partA.score > 0.5) {
        pose_layer.stroke(0);
        pose_layer.line(
          partA.position.x,
          partA.position.y,
          partB.position.x,
          partB.position.y
        );
      }
    }
  }
}
