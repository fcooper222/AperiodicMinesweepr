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


let selectedTile = null;
let startMousePos = null;

let flagMode = false;
let dragging = false;
let leaderboardVisible = false;
let colourSelectVisible = false;
let is3DMode = false;
let uibox = true;
let headerHeight=100;
let leaderboardWidth=500;
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

  if (is3DMode)return explored3DColour;

  if (!tile.is_explored) {
    if (tile==tileArr.selected_tile){
      return selectedColour
    } else return unexploredColour
  } 
  return exploredColour;
}


function drawFlagAt(tile){
  let tileCentrePt = transPt(translation_vector, tile.centre);
  image(
    flagSprite,
    tileCentrePt.x-25,
    tileCentrePt.y-25,
    flagSprite.width*0.35,
    flagSprite.height*0.35
  );
}
function drawShapeIMG(tile) {
  //first get centre of img
  let tileCentrePt = transPt(translation_vector, tile.centre);
  let tileIMG = spriteImages[tile.image_idx];
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



function preload(){
  spriteSheet = loadImage('spritenew-min.png'); 
}

function togglePanel(panelId) {
  if (select('#' + panelId) === null) {
      let panel = createDiv('');
      panel.id(panelId);
      //populate and slide in
      if (panelId === 'leaderboard') {
          populateLeaderboard(panel);
      } else if (panelId === 'colour-selector') { 
          populateColourSelect(panel);
      }

      setTimeout(() => {
          panel.style('right', '0px');
      }, 10);
  } else {
    //slide out and destroy panel
      let panel = select('#' + panelId);
      panel.style('right', '-500px');
      setTimeout(() => panel.remove(), 300);
  }
}

function toggleLeaderboard() {
  togglePanel('leaderboard');
  leaderboardVisible = !leaderboardVisible;
  loop();
}

function toggleColourSelect() {
  togglePanel('colour-selector');
  colourSelectVisible = !colourSelectVisible;
  loop();
}

function populateLeaderboard(panel) {
  const scores = JSON.parse(localStorage.getItem('highScores')) || [];
  scores.sort((a, b) => b - a);
  scores.slice(0, 10).forEach((score, index) => {
    createDiv(`${index + 1}. ${score}`).parent(panel);
  });
}
function populateColourSelect(panel) {
  const explored_picker = createColorPicker('#ffffff');
  explored_picker.parent(panel);
  
  const explored_btn = createButton('Change Explored colour');
  explored_btn.parent(panel);
  explored_btn.mousePressed(() => {
       exploredColour = explored_picker.color();
  });

  const unexplored_picker = createColorPicker('#ffffff');
  unexplored_picker.parent(panel);
  
  const unexplored_btn = createButton('Change Unexplored colour');
  unexplored_btn.parent(panel);

  unexplored_btn.mousePressed(() => {
      unexploredColour = unexplored_picker.color();
  });

  const toggle3DBtn = createButton('Toggle 3D Mode');
  toggle3DBtn.parent(panel);
  toggle3DBtn.mousePressed(() => {
      is3DMode = !is3DMode;
  });
}

function saveScore(score) {
  let scores = JSON.parse(localStorage.getItem('highScores')) || [];
  scores.push(score);
  scores.sort((a, b) => b - a);
  scores = scores.slice(0, 10);
  localStorage.setItem('highScores', JSON.stringify(scores));
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
    flag_btn.style('background-color', flagMode ? 'rgba(255, 0, 0, 0.9)' : 'rgba(42, 42, 42, 0.9)');

    loop();
  });

  color_btn = createButton('Change Color Scheme');
  color_btn.mousePressed(() => {
    toggleColourSelect();
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

  explored3DColour = color(189);
  unexploredColour = color(200,150,200);
  selectedColour = color(230,200,230);
  exploredColour = color(100,100,150);

  //setup header buttons 
  setupHeader();

  radio = createRadio();
  radio.mousePressed(function () {
    loop();
  });
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
    if (tile.is_explored || tile == tileArr.selected_tile){
      drawShape(tile);
    } else {
      if (is3DMode){
      drawShapeIMG(tile);
      } else drawShape(tile);
    }
  }

  //draw flagged tiles

  for (let tile of tileArr.flagged_tiles){
    drawFlagAt(tile);
  }
  pop();
}

function updateScore(newScore) {
  console.log("new score!!!" + newScore);
  score = newScore; 
  scoreDisplay.innerHTML = `Score: ${score}`; 
}
function isOnCanvas(x,y){
  return ((y>headerHeight) && (x<=(windowWidth-leaderboardWidth) || (!leaderboardVisible || !colourSelectVisible)))
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
  console.log("mouse pt: "+ mouseX + " " + mouseY);
  if (!isOnCanvas(mouseX, mouseY)) return;

  dragging = false;
  startMousePos = { x: mouseX, y: mouseY };
  
  let mousePt = translateMousePt(mouseX, mouseY);
  const closest = tileArr.findClosestTile(mousePt);
  if (closest && !closest.is_explored) {
      selectedTile = closest;
      tileArr.changeSelected(closest);
      redraw();
  }
  
  loop();
}

function mouseDragged() {
  if (!isOnCanvas(mouseX, mouseY)) return;

  const moveDistance = dist(mouseX, mouseY, startMousePos.x, startMousePos.y);
  const dragThreshold = 5;
  
  if (moveDistance > dragThreshold) {
      dragging = true;
      
      // Clear selection if we move too far
      if (selectedTile) {
          tileArr.changeSelected(null); 
          selectedTile = null;
          redraw();
      }
      
      const delta = ttrans(mouseX - pmouseX, mouseY - pmouseY);
      to_screen = mul(delta, to_screen);
      translation_vector = mul(delta, translation_vector);
  }
  
  loop();
  return false;
}

function mouseReleased() {
  if (!isOnCanvas(mouseX, mouseY)) return;

  if (selectedTile && !dragging) {
      tileArr.handleInteraction(selectedTile, flagMode);
  }
  
  dragging = false;
  tileArr.changeSelected(null);
  startMousePos = null;
  
  loop();
}
