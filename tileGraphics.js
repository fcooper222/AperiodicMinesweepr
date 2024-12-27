//file to store the graphics for the each of the tiles, and possibly the numbers / mines too.
let tileImages = [];
let floatTolerance = 0.001;
function loadTilePixels() {
  tileSpriteSheet.loadPixels();

  tileImages.push(tileSpriteSheet.get(0, 0, 400, 400)); // DL Mir
  tileImages.push(tileSpriteSheet.get(400, 0, 400, 400)); //DL
  tileImages.push(tileSpriteSheet.get(800, 0, 400, 400)); //D Mir
  tileImages.push(tileSpriteSheet.get(1200, 0, 400, 400)); // DR
  tileImages.push(tileSpriteSheet.get(0, 400, 400, 400)); // DR Mir
  tileImages.push(tileSpriteSheet.get(400, 400, 400, 400)); // D
  tileImages.push(tileSpriteSheet.get(800, 400, 400, 400)); // UL
  tileImages.push(tileSpriteSheet.get(1200, 400, 400, 400)); // UL Mir
  tileImages.push(tileSpriteSheet.get(0, 800, 400, 400)); // U Mir
  tileImages.push(tileSpriteSheet.get(400, 800, 400, 400)); // UR
  tileImages.push(tileSpriteSheet.get(800, 800, 400, 400)); // UR Mir
  tileImages.push(tileSpriteSheet.get(1200, 800, 400, 400)); // U

  noSmooth();
}

function calculateTileImage(matrix) {
  //decision tree based off of unique properties of the matrices that represent each different orientation
  // return the index of the above array ^^^^^^^
  if (Math.abs(matrix[1]) < floatTolerance) {
    //up or down
    if (matrix[0] > 0) {
      if (matrix[4] > 0) {
        //up mirror
        return 8;
      } else {
        //down no mirror
        return 5;
      }
    } else {
      if (matrix[4] > 0) {
        //up no mirror
        return 11;
      } else {
        //down mirror
        return 2;
      }
    }
  } else {
    //diagonal orientation
    if (matrix[0] > 0) {
      if (matrix[1] > 0) {
        if (matrix[3] > 0) {
          //down left no mirror
          return 1;
        } else {
          //up left mirror
          return 7;
        }
      } else {
        if (matrix[3] > 0) {
          //up right mirror
          return 10;
        } else {
          //down right no mirror
          return 3;
        }
      }
    } else {
      if (matrix[1] > 0) {
        if (matrix[3] > 0) {
          // up left no mirror
          return 6;
        } else {
          // down left mirror
          return 0;
        }
      } else {
        if (matrix[3] > 0) {
          //down right mirror
          return 4;
        } else {
          // up right no mirror
          return 9;
        }
      }
    }
  }
}
