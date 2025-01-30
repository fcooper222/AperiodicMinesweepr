//main file, that is used to build the webpage and contains code that draws the canvas


let to_screen = [20, 0, 0, 0, -20, 0];
let translation_vector = [1, 0, 0, 0, 1, 0];
let scaleFactor = 10;
let lw_scale = 1;
let score;
let tiles;
let level;

let scale_centre;
let scale_start;
let scale_ts;

let reset_button;
let subst_button;
let translate_button;
let scale_button;
let draw_hats;
let draw_super;
let radio;
let leaderboardElement;


let dragging = false;
let leaderboardVisible = false;
let uibox = true;
let box_height = 10;

let height_ratio = 1;
let width_ratio = 1;
let adjaceny_radius = 56;

let svg_serial = 0;
let scoreDisplay;

const cols = {};
let black;
let red;
//legacy draw function


function decideColour(tile) {
  //case for determining what to fill a tile in, characteristics include, whether or not it is seleceted, whether or not it has been explored
  if (!tile.is_explored) {
    return unexploredColour;
  } else return exploredColour;
}
function drawShapeIMG(tile) {
  //first get centre of img
  let tileCentrePt = transPt(translation_vector, tile.centre);
  let tileIMG = spriteImages[selectImage(tile)];
  let IMGCentreX = tileCentrePt.x - 66;
  let IMGCentreY = tileCentrePt.y - 73;
  image(
    tileIMG,
    IMGCentreX,
    IMGCentreY,
    tileIMG.width,
    tileIMG.height
  );
}
function drawShape(tile, debug = false) {
  push();
  let colour = decideColour(tile);

  fill(colour);
  stroke(black);
  strokeWeight(1);

  beginShape();

  for (let p of hat_outline) {
    const tp = transPt(mul(translation_vector, tile.trans), p);
    vertex(tp.x, tp.y);
  }

  endShape(CLOSE);
  if (tile.adjacency_number) {
    textAlign(CENTER, CENTER);
    fill(0);
    const tc = transPt(translation_vector, tile.centre);
    text(tile.adjacency_number, tc.x, tc.y);
  }
  if (debug == true) {
    // render hat centre pts and the adjaceny checking radii
    fill("red");
    noStroke();
    ellipse(
      mul(translation_vector, tile.centre.x),
      mul(translation_vector, tile.centre.y),
      5,
      5
    );

    noFill();
    stroke("black");
    strokeWeight(1);
  }

  pop();
}

function findCentreOfShape(shape, T) {
  let tpts = [];
  for (let p of shape) {
    tpts.push(transPt(T, p)); // Add each transformed point to tpts
  }
  let sumX = 0;
  let sumY = 0;

  for (let pt of tpts) {
    sumX += pt.x;
    sumY += pt.y;
  }

  const cx = sumX / tpts.length;
  const cy = sumY / tpts.length;
  return pt(cx, cy);
}




function isButtonActive(but) {
  return but.elt.style.border.length > 0;
}

function setButtonActive(but, b) {
  but.elt.style.border = b ? "3px solid black" : "";
}


function preload(){
  spriteSheet = loadImage('sprite_sheet.png'); 
}
function toggleLeaderboard() {
  if (!leaderboardVisible) {
      let leaderboard = createDiv('');
      leaderboard.id('leaderboard');
      
      // makes sure the aninm only starts after elt created
      setTimeout(() => {
          leaderboard.style('right', '20px');  // slide in 
      }, 10);
  } else {
      // slide out
      let board = select('#leaderboard');
      board.style('right', '-300px');  
      setTimeout(() => board.remove(), 300);  
  }
  
  leaderboardVisible = !leaderboardVisible;
  loop();
}

function setupHeader() {
  let header = createElement('div', '');
  header.class('header');
 
  reset_btn = createButton('Reset');
  reset_btn.mousePressed(() => {
    tiles = [H_init, T_init, P_init, F_init];
    level = 1;
    score = 0;
    translation_vector = [1, 0, 0, 0, 1, 0];
    tileArr.changeSelected(null);
    tileArr.clear();
    loop();
  });

  build_super_btn = createButton('Build Supertiles');

  build_super_btn.mousePressed(() => {
    const patch = constructPatch(...tiles);
    tiles = constructMetatiles(patch);
    const idx = { H: 0, T: 1, P: 2, F: 3 }[radio.value()];
    buildTileArray(tiles[idx], level);
    print(tileArr.getTiles());
    ++level;
    loop();
  });

  flag_btn = createButton('Toggle Flag Mode');
  flag_btn.mousePressed(() => {
    flagMode = !flagMode;
    loop();
  });

  color_btn = createButton('Change Color Scheme');
  color_btn.mousePressed(() => {
    showColourSelect();
  });

  
  leaderboard_btn = createButton('View Leaderboard');
  leaderboard_btn.mousePressed(() => {
    toggleLeaderboard();
  });

  // add bts to header
  reset_btn.parent(header);
  build_super_btn.parent(header);
  flag_btn.parent(header);
  color_btn.parent(header);
  leaderboard_btn.parent(header);
}






function setup() {
  tileArr = new TileArray();
  loadGraphics();
  windowWidth, windowHeight;
  const canvasWidth = windowWidth * width_ratio;
  const canvasHeight = windowHeight * height_ratio;
  createCanvas(canvasWidth, canvasHeight);
  scoreDisplay = document.getElementById("scoreDisplay");

  tiles = [H_init, T_init, P_init, F_init];
  level = 1;
  score = 0;

  black = color("black");
  red = color("red");
  unexploredColour = color(189);
  selectedColour = color(189);
  exploredColour = color(189);

  //setup top buttons 
  setupHeader();

  radio = createRadio();
  radio.mousePressed(function () {
    loop();
  });
  radio.position(10, box_height);
  radio.style("visibility", "hidden");
  for (let s of ["H", "T", "P", "F"]) {
    let o = radio.option(s);
    o.onclick = loop;
  }
  radio.selected("H");
}

function draw() {
  background(255);
  translate(width / 2, height / 2);

  push();
  //draw selected tile first for aesthetic reasons
  if (tileArr.selected_tile) {
    drawShape(tileArr.selected_tile);
  }
  let tilesOnCanvas = tileArr.rangeSearch(
    -windowWidth,
    windowWidth,
    -windowHeight,
    windowHeight
  );
  for (let tile of tilesOnCanvas) {
    if (tile.is_explored){
      drawShape(tile);
    } else {
      drawShapeIMG(tile);
    }
  }
  pop();
}

function updateScore(newScore) {
  console.log("new score!!!" + newScore);
  score = newScore; 
  scoreDisplay.innerHTML = `Score: ${score}`; 
}

function translateMousePt(x,y){
  const canvasWidth = windowWidth * width_ratio;
  const canvasHeight = windowHeight * height_ratio;
  const newPt = {
    x: x - canvasWidth / 2,
    y: y - canvasHeight / 2,
  }
  return newPt;
}

function windowResized() {
  //canvas covers only 60% of the whole window to improve performance
  const canvasWidth = windowWidth * width_ratio;
  const canvasHeight = windowHeight * height_ratio;
  resizeCanvas(canvasWidth, canvasHeight);
  console.log("resize");
}

function mousePressed() {
  dragging = true;
  //always ensure correct size when doing calculation
  let mousePt = translateMousePt(mouseX,mouseY);
  console.log(tileArr);

  const closest = tileArr.findClosestTile(mousePt);
  if (closest) {
    if (!closest.is_explored) {
      tileArr.handleInteraction(closest);
      redraw();
    }
  }
  loop();
}

function mouseDragged() {
  if (dragging) {
    to_screen = mul(ttrans(mouseX - pmouseX, mouseY - pmouseY), to_screen);

    const delta = ttrans(mouseX - pmouseX, mouseY - pmouseY);
    translation_vector = mul(delta, translation_vector);

    loop();
    return false;
  }
}

function mouseReleased() {
  dragging = false;
  loop();
}

function mouseMoved() {
  let mousePt = translateMousePt(mouseX,mouseY);

  const closest = tileArr.findClosestTile(mousePt);
  if (closest) {
    tileArr.changeSelected(closest);
  }
}
