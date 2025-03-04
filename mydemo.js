const tileManager = new TileArray();
let translation_vector = [1, 0, 0, 0, 1, 0];
let scaleFactor = 10;
let tiling = null;
let editor_box = makeBox(10, 350, 200, 240);
const phys_unit = 60;
let selectedTile = null;
let dragging = false;

// Colors
let black_colour;
let white_colour;
let exploredColour;
let unexploredColour;
let selectedColour;

function drawShape(tile, debug = false) {
  push();
  let colour = decideColour(tile);
  fill(colour);
  stroke(black_colour);
  strokeWeight(1);
  beginShape();
  
  // Get the tiling shape
  const proto = tiling.getPrototile();
  for (let shape of proto.shape()) {
    const tp = transPt(mul(translation_vector, tile.trans), shape);
    vertex(tp.x, tp.y);
  }
  endShape(CLOSE);
  
  if (debug) {
    let tileCentrePt = transPt(translation_vector, tile.centre);
    fill("red");
    noStroke();
    ellipse(tileCentrePt.x, tileCentrePt.y, 5, 5);
    stroke("black");
  }
  pop();
}

function decideColour(tile) {
  if (tile === selectedTile) {
    return selectedColour;
  }
  return tile.is_explored ? exploredColour : unexploredColour;
}

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent("sktch");
  
  // Initialize tiling
  tiling = new EditableTiling(editor_box.w, editor_box.h, phys_unit);
  tiling.setType(1); // IH01 tiling type
  
  // Initialize colors
  black_colour = color(0);
  white_colour = color(255);
  exploredColour = color(100, 100, 150);
  unexploredColour = color(200, 150, 200);
  selectedColour = color(230, 200, 230);
  
  // Create initial tiles
  createInitialTiles();
}

function createInitialTiles() {
  // Create a central tile
  const centralTile = {
    centre: { x: 0, y: 0 },
    trans: [1, 0, 0, 0, 1, 0],
    is_explored: false
  };
  
  tileManager.add(centralTile);
  
  // Create surrounding tiles
  const proto = tiling.getPrototile();
  const tileShape = tiling.getTileShape();
  
  // Create a ring of tiles around the central one
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const distance = phys_unit * 1.5;
    
    const newTrans = [
      1, 0, distance * Math.cos(angle), 
      0, 1, distance * Math.sin(angle)
    ];
    
    const newTile = {
      centre: { x: distance * Math.cos(angle), y: distance * Math.sin(angle) },
      trans: newTrans,
      is_explored: false
    };
    
    tileManager.add(newTile);
  }
}

function draw() {
  background(255);
  translate(width / 2, height / 2);
  
  push();
  // Draw selected tile first
  if (selectedTile) {
    drawShape(selectedTile);
  }
  
  // Draw visible tiles
  let tilesOnCanvas = tileManager.rangeSearch(
    -width/2 - 50,
    width/2 + 50,
    -height/2 - 50,
    height/2 + 50
  );
  
  for (let tile of tilesOnCanvas) {
    if (tile !== selectedTile) {
      drawShape(tile);
    }
  }
  pop();
}

function mousePressed() {
  if (!isOnCanvas(mouseX, mouseY)) return;
  
  dragging = false;
  let mousePt = translateMousePt(mouseX, mouseY);
  const closest = tileManager.findClosestTile(mousePt);
  
  if (closest) {
    selectedTile = closest;
    loop();
  }
}

function mouseDragged() {
  if (!isOnCanvas(mouseX, mouseY)) return;
  
  dragging = true;
  if (selectedTile) {
    selectedTile = null;
  }
  
  const delta = ttrans(mouseX - pmouseX, mouseY - pmouseY);
  translation_vector = mul(delta, translation_vector);
  
  loop();
  return false;
}

function mouseReleased() {
  if (!isOnCanvas(mouseX, mouseY)) return;
  
  if (selectedTile && !dragging) {
    if (mouseButton === LEFT) {
      tileManager.handleInteraction(selectedTile, false);
    } else if (mouseButton === RIGHT) {
      tileManager.handleInteraction(selectedTile, true);
    }
  }
  
  dragging = false;
  selectedTile = null;
  loop();
}

function isOnCanvas(x, y) {
  return x >= 0 && x <= width && y >= 0 && y <= height;
}

function translateMousePt(x, y) {
  return {
    x: x - width / 2,
    y: y - height / 2
  };
}

function ttrans(dx, dy) {
  return [1, 0, dx, 0, 1, dy];
}

// Function to add helper methods to existing TileArray class if needed
function extendTileArray() {
  // Example of adding a method if needed
  if (!TileArray.prototype.hasOwnProperty('findTilesInView')) {
    TileArray.prototype.findTilesInView = function(viewWidth, viewHeight) {
      return this.rangeSearch(-viewWidth/2, viewWidth/2, -viewHeight/2, viewHeight/2);
    };
  }
}

// Call this early in initialization
extendTileArray();