//loads each elt in the sprite sheet and puts it in the array :)
const float_threshold = 0.001 // just incase we get very small floating point numbers that mess up checks for the transformaiton orientation
let spriteImages3D = [];
let spriteImages2D = [];
let flagSprite; 
let mineSprite;

function loadGraphics() {
    //1 off set to remove the black border, each square is thus 99x99
    spriteSheet3D.loadPixels();
    spriteSheet2D.loadPixels();
    for (let i = 0; i < 7; i++) {
        spriteImages3D.push(spriteSheet3D.get(2 + i * 100, 2, 97, 97));
        spriteImages2D.push(spriteSheet2D.get(2 + i * 100, 2, 97, 97));

    }
    for (let i = 0; i < 7; i++) {
        spriteImages3D.push(spriteSheet3D.get(2 + i * 100, 102, 97, 97));
        spriteImages2D.push(spriteSheet2D.get(2 + i * 100, 102, 97, 97));

    }
    flagSprite = spriteImages3D[13];
    mineSprite = spriteImages3D[6];
}



  function selectImage(trans){
    //selects an image to render relative to the transformation matrix of the hat tile
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

  