//main file, that is used to build the webpage and contains code that draws the canvas

let to_screen = [20, 0, 0, 0, -20, 0];
let translation_vector = [1, 0, 0, 0, 1, 0];
let scaleFactor = 10;
let lw_scale = 1;
let score;
let tiles;
let level;
let n_tiles = [];

let difficulty_levels = ["easy", "medium", "hard"];
let difficulty_map = {
  "easy": 0.2,
  "medium": 0.25,
  "hard": 0.3
};
let current_difficulty_index = 0;
let game_difficulty = difficulty_map[difficulty_levels[current_difficulty_index]];


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
let start_time;


let selectedTile = null;
let startMousePos = null;

let flagMode = false;
let dragging = false;
let firstGridClick = false;
let isGameRunning = false;
let is3DMode = false;
let uibox = true;
let headerHeight=100;
let leaderboardWidth=500;
let box_height = 10;

let height_ratio = 1;
let width_ratio = 1;
let adjacency_radius = 56;


let svg_serial = 0;
let scoreDisplay;

const cols = {};
let black_colour;
let red_colour;


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


function drawSpriteAt(tile,flag=true){
  let tileCentrePt = transPt(translation_vector, tile.centre);
  if (flag){
  image(
    flagSprite,
    tileCentrePt.x-30,
    tileCentrePt.y-30,
    flagSprite.width*0.6,
    flagSprite.height*0.6
  );
}
  else {
    image(
      mineSprite,
      tileCentrePt.x-30,
      tileCentrePt.y-30,
      flagSprite.width*0.6,
      flagSprite.height*0.6
    );
  }
}
function drawShapeIMG(tile,bool3D=true) {
  //first get centre of img
  let tileCentrePt = transPt(translation_vector, tile.centre);
  let tileIMG = bool3D ? spriteImages3D[tile.image_idx] : spriteImages2D[tile.image_idx];
  let IMGCentreX = tileCentrePt.x - 48;
  let IMGCentreY = tileCentrePt.y - 48;
  image(
    tileIMG,
    IMGCentreX,
    IMGCentreY,
    tileIMG.width,
    tileIMG.height
  );
  if (tile.is_explored && tile.adjacency_number) {
    textAlign(CENTER, CENTER);
    let adj_to_textcolour_map = {
      1: color(0, 128, 0),     
      2: color(0, 0, 255),     
      3: color(255, 0, 0),    
      4: color(255, 192, 203) 
    };    
    fill(adj_to_textcolour_map[tile.adjacency_number]);
    const tc = transPt(translation_vector, tile.centre);
    textFont('Verdana');
    textStyle(BOLD);
    textSize(22)
    text(tile.adjacency_number, tc.x, tc.y);
  }
}
function drawShape(tile, debug = false) {
  push();
  let colour = decideColour(tile);

  fill(colour);
  stroke(black_colour);
  strokeWeight(1);

  beginShape();

  for (let p of hat_outline) {
    const tp = transPt(mul(translation_vector, tile.trans), p);
    vertex(tp.x, tp.y);
  }

  endShape(CLOSE);
  if (tile.adjacency_number) {
    textAlign(CENTER, CENTER);
    const brightness = red(exploredColour) * 0.299 + green(exploredColour) * 0.587 + blue(exploredColour) * 0.114;
    if (brightness > 186) {
      fill(0);  // Dark text for light backgrounds
    } else {
      fill(255);  // Light text for dark backgrounds
    }
    const tc = transPt(translation_vector, tile.centre);
    textSize(16)
    text(tile.adjacency_number, tc.x, tc.y);
  }
  if (debug == true) {
    // render hat centre pts and the adjacency checking radii
    let tileCentrePt = transPt(translation_vector, tile.centre);
    fill("red");
    noStroke();
    ellipse(
      tileCentrePt.x,tileCentrePt.y,     
      5,
      5
    );
    stroke("black")
  }
  pop();
}


function preload(){
  spriteSheet3D = loadImage('sprites3D.png'); 
  spriteSheet2D = loadImage('sprites2D.png');
}


function setupPanels() {
  setupHeader();
  setupLeaderboard();
  updateLeaderboard();
  setupColourSelect();
  setupFooter();
}

function setupColourSelect() {
  let panel = createDiv('');
  panel.id('colour-selector');
  populateColourSelect(panel);
}

function changeButtonColour() {
  const buttons = selectAll('button');
  buttons.forEach(btn => {
      // Convert p5 color to CSS rgba string
      const bgColourString = `rgba(${red(unexploredColour)}, ${green(unexploredColour)}, ${blue(unexploredColour)}, ${alpha(unexploredColour)/255})`;
      btn.style('background', bgColourString); 
      btn.style('--bg', bgColourString);      

      // Calculate brightness for text color, i.e black on bright, white on dark
      const brightness = red(unexploredColour) * 0.299 +
                       green(unexploredColour) * 0.587 +
                       blue(unexploredColour) * 0.114;
      const textColour = brightness > 186 ? '#000000' : '#ffffff';
      btn.style('--text-color', textColour);
      
      // darker colour for shadow
      const shadowColour = color(
          red(unexploredColour) * 0.8,
          green(unexploredColour) * 0.8,
          blue(unexploredColour) * 0.8
      );
      const shadowColourString = `rgba(${red(shadowColour)}, ${green(shadowColour)}, ${blue(shadowColour)}, 1)`;
      
      btn.style('box-shadow', `${shadowColourString} 0px 7px 2px, #000 0px 8px 5px`);
      //update leaderboard style
      const cards = selectAll('.card');
      cards.forEach(card => {
          card.style('background', bgColourString + ' !important');
      });
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
      changeButtonColour();
  });

  const toggle3DBtn = createButton('Toggle 3D Mode');
  toggle3DBtn.parent(panel);
  toggle3DBtn.mousePressed(() => {
      is3DMode = !is3DMode;
  });

  const spacer = createDiv();
  spacer.parent(panel);
  spacer.style('height', '50px');
  
  // Add preset section title
  const preset_title = createDiv('Select preset colour scheme');
  preset_title.parent(panel);
  preset_title.class('preset-title');
  
  // Jungle preset button
  const jungle_btn = createButton('Jungle');
  jungle_btn.parent(panel);
  jungle_btn.mousePressed(() => {
    explored_picker.value('#228B22');    
    unexplored_picker.value('#006400');  
    exploredColour = explored_picker.color();
    unexploredColour = unexplored_picker.color();
    changeButtonColour();
  });
  
  // Desert preset button
  const desert_btn = createButton('Desert');
  desert_btn.parent(panel);
  desert_btn.mousePressed(() => {
    explored_picker.value('#D2B48C');    
    unexplored_picker.value('#F4A460');  
    exploredColour = explored_picker.color();
    unexploredColour = unexplored_picker.color();
    changeButtonColour();
  });
  
  // Ocean preset button
  const ocean_btn = createButton('Ocean');
  ocean_btn.parent(panel);
  ocean_btn.mousePressed(() => {
    explored_picker.value('#006994');    
    unexplored_picker.value('#40A4DF');  
    exploredColour = explored_picker.color();
    unexploredColour = unexplored_picker.color();
    changeButtonColour();
  });
  
  // Mars preset button
  const mars_btn = createButton('Mars');
  mars_btn.parent(panel);
  mars_btn.mousePressed(() => {
    explored_picker.value('#C1440E');    
    unexplored_picker.value('#964B00'); 
    exploredColour = explored_picker.color();
    unexploredColour = unexplored_picker.color();
    changeButtonColour();
  });
}

function saveGameEntry(score, minesFlagged, timeInSeconds) {
  const entries = JSON.parse(localStorage.getItem('gameEntries')) || [];
  
  const newEntry = {
      score: score,
      minesFlagged: minesFlagged,
      time: timeInSeconds
  };
  entries.push(newEntry);
  localStorage.setItem('gameEntries', JSON.stringify(entries));
  
  updateLeaderboard(); 
}


function updateTimer() {
  if (!isGameRunning) return;
  
  let current_time = millis();
  let elapsedTime = Math.floor((current_time - start_time) / 1000); 
  
  let minutes = Math.floor(elapsedTime / 60);
  let seconds = elapsedTime % 60;
  
  minutes = minutes.toString().padStart(2, '0');
  seconds = seconds.toString().padStart(2, '0');
  
  timer_display.html(`Time: ${minutes}:${seconds}`);
}

function stopTimer() {
  isGameRunning = false;
  firstGridClick = false;
}

function resetTimer() {
  start_time = millis();
  score=0;
}
function startTimer(){
  isGameRunning = true;
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
    updateScore(0);
    n_tiles=[];
    stopTimer();
    resetTimer();
    loop();
  });

  build_super_btn = createButton('Start Game');

  build_super_btn.mousePressed(() => {
    if (!isGameRunning){
      for (let i =0;i<5;i++){
        const patch = constructPatch(...tiles);
        tiles = constructMetatiles(patch);
        const idx = { H: 0, T: 1, P: 2, F: 3 }[radio.value()];
        buildTileArray(tiles[0], level);
        ++level;
      }
      const idx = { H: 0, T: 1, P: 2, F: 3 }[radio.value()];
      buildTileArray(tiles[0], level);
      resetTimer();
      startTimer();
      loop();
    }
  });

  score_display = createElement('div', `Score: ${score}`);
  score_display.class('score-display');

  timer_display = createElement('div', 'Time: 00:00');
  timer_display.class('timer-display');


  clb_btn = createButton('Clear Leaderboard');
  clb_btn.mousePressed(() => {
    clearLeaderboard();
    loop();
  });

 
  let difficulty_btn = createButton(`Toggle Difficulty: ${difficulty_levels[current_difficulty_index]}`);
  difficulty_btn.mousePressed(() => {
    // we dont want to reset the game, this button simply sets difficulty for the next time 'begin game' is pressed
    current_difficulty_index = (current_difficulty_index + 1) % difficulty_levels.length;
    game_difficulty = difficulty_map[difficulty_levels[current_difficulty_index]];
    difficulty_btn.html(`Toggle Difficulty: ${difficulty_levels[current_difficulty_index]}`);

  });

  reset_btn.parent(header);
  build_super_btn.parent(header);
  score_display.parent(header);
  timer_display.parent(header);
  clb_btn.parent(header);
  difficulty_btn.parent(header);
}



function setupFooter(){
  let footer = createDiv('');
  footer.class('footer');
  
  version_info = createP('Version 1.0');
  version_info.style('color', '#ffffff');
  version_info.style('margin', '0');
  
  credits_btn = createButton('Credits');
  credits_btn.mousePressed(() => {
      console.log('Credits clicked');
  });
  
  help_btn = createButton('Help');
  help_btn.mousePressed(() => {
      console.log('Help clicked');
  });
  
  copyright = createP('© ' + year());
  copyright.style('color', '#ffffff');
  copyright.style('margin', '0');

  version_info.parent(footer);
  help_btn.parent(footer);
  credits_btn.parent(footer);
  copyright.parent(footer);

}


function handleGameOver(mines_flagged){
    // have stepped on a mine!!!
    // do two things, show where all the mines were on the grid, then update the leaderboard
    stopTimer();
  
  // Get the final time
    let current_time = millis();
    let elapsedTime = Math.floor((current_time - start_time) / 1000);
    saveGameEntry(score,mines_flagged,elapsedTime)

    //lb updated, now show where all mines were. done by the gamerunnning bool

}

function handleFirstClick(selected_tile){
  //populate the tileArray with mines,ensuringn that selected_tile, the one that was clicked, is not a mine
  let adj_tiles = tileArr.findAdjacentTo(selected_tile)
  for (let tile of tileArr.getTiles())
    if (tile != selected_tile && !adj_tiles.includes(tile)){
      tile.setMine(Math.random() < game_difficulty);
    }
}


function setup() {
  tileArr = new TileArray();

  loadGraphics();
  windowWidth,windowHeight;
  const canvas = createCanvas(
    (windowWidth - 600) * width_ratio,
    (windowHeight - 150) * height_ratio
  );
  canvas.parent(createDiv('').addClass('main-content'));
  
  document.querySelector('canvas').addEventListener('contextmenu', e => e.preventDefault());

  tiles = [H_init, T_init, P_init, F_init];
  level = 1;
  score = 0;

  black_colour = color("black");
  red_colour = color("red");
  green_colour=color("green");     
  blue_colour = color("blue");       
  yellow_colour = color("yellow");     
  magenta_colour = color("magenta"); 
  cyan_colour = color("cyan");
  white_colour = color("white");


  explored3DColour = color(189);
  unexploredColour = color(200,150,200);
  selectedColour = color(230,200,230);
  exploredColour = color(100,100,150);

  //setup header buttons 
  setupPanels();

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
  changeButtonColour();
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
    -width / 2 -50,
    width / 2 + 50,
    -height / 2 -50,
    height / 2 + 50
  );
  for (let tile of tilesOnCanvas) {
    if (is3DMode){
      if (tile.is_explored || tile == tileArr.selected_tile){
        drawShapeIMG(tile,false);
      } else { drawShapeIMG(tile,true);}

    } else {
      drawShape(tile);
    }
  }

  //draw flags after to ensure flags are on top

  for (let tile of tileArr.flagged_tiles){
    drawSpriteAt(tile);
  }
  pop();
  updateTimer();


  if (!isGameRunning){
    //draw all tiles as explored, and then draw all mines.
    let tilesOnCanvas = tileArr.rangeSearch(
      -width / 2 -50,
      width / 2 + 50,
      -height / 2 -50,
      height / 2 + 50
    );
    for (let tile of tilesOnCanvas) {
      drawShape(tile);
      if (tile.is_mine){
        drawSpriteAt(tile,false); //draws mine at all tiles
      }
    }


  }
}

function updateScore(newScore) {
  score = newScore; 
  score_display.html(`Score: ${score}`);
}
function isOnCanvas(x, y) {
  return (
    x >= 0 && 
    x <= width && 
    y >= 0 && 
    y <= height  
  );
}
function translateMousePt(x,y){
  const newPt = {
    x: x - width / 2,
    y: y - height / 2,
  }
  return newPt;
}

function windowResized() {
  const canvasWidth = (windowWidth - 600) * width_ratio;
  const canvasHeight = (windowHeight - 150) * height_ratio;
  resizeCanvas(canvasWidth, canvasHeight);
}
function mousePressed() {
  if (!isOnCanvas(mouseX, mouseY) || !isGameRunning) return;

  dragging = false;
  startMousePos = { x: mouseX, y: mouseY };
  
  let mousePt = translateMousePt(mouseX, mouseY);
  const closest = tileArr.findClosestTile(mousePt);
  if (closest && !closest.is_explored) {
    if (firstGridClick == false){
      handleFirstClick(closest);
      firstGridClick = true;
    }
      selectedTile = closest;
      tileArr.changeSelected(closest);
      redraw();
  }
  
  loop();
}

function mouseDragged() {
  if (!isOnCanvas(mouseX, mouseY) || !isGameRunning) return;

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
  if (!isOnCanvas(mouseX, mouseY) || !isGameRunning) return;

  if (selectedTile && !dragging) {
    if (mouseButton === LEFT) {
      tileArr.handleInteraction(selectedTile, false);  // Normal mode
  } else if (mouseButton === RIGHT) {
      tileArr.handleInteraction(selectedTile, true);   // Flag mode
  }  }
  
  dragging = false;
  tileArr.changeSelected(null);
  startMousePos = null;
  
  loop();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    decideColour
  };
}