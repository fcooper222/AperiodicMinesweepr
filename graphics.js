//loads each elt in the sprite sheet and puts it in the array :)
const float_threshold = 0.001 // just incase we get very small floating point numbers that mess up checks for the transformaiton orientation
let spriteImages = [];


function loadGraphics() {
    spriteSheet.loadPixels();

    for (let i = 0; i < 7; i++) {
      spriteImages.push(spriteSheet.get(i * 100, 0, 100, 100));
    }
    for (let i = 0; i < 7; i++) {
      spriteImages.push(spriteSheet.get(i * 100, 100, 100, 100));
    }
  }



  function selectImage(tile){
    //selects an image to render relative to the transformation matrix of the hat tile
    let trans = tile.trans;
    //check for up down mirror / no mirror cases
    if (Math.abs(trans[1])<float_threshold){
        if (trans[0]>(float_threshold*-1)){
            if (trans[4]>0){
                return 9
            } else return 0;
        } 
        if (trans[4]>0){
            return 3
        } else return 12;
        }
        
        //up left or down right
    if (trans[0]>0){
        if (trans[1]>0){
            if (trans[3]>0){
                return 1
            } else return 8;
        } else {
            if (trans[3]>0){
                return 10
            } else return 5;
        }

    // up right or down left
    } else {
        if (trans[1]>0){
            if (trans[3]>0){
                return 2;
            } else return 7;
        } else {
            if (trans[3]>0){
                return 11;
            } else return 4;
        }
    }
    }

  