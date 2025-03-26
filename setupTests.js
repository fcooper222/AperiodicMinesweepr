global.createCanvas = jest.fn();
global.background = jest.fn();
global.fill = jest.fn();
global.stroke = jest.fn();
global.beginShape = jest.fn();
global.endShape = jest.fn();
global.vertex = jest.fn();
global.CLOSE = 'close';
global.loadImage = jest.fn().mockResolvedValue({});
global.image = jest.fn();
global.ellipse = jest.fn();
global.strokeWeight = jest.fn();
global.textAlign = jest.fn();
global.CENTER = 'center';
global.text = jest.fn();
global.textSize = jest.fn();

// Mock game-specific globals
global.translation_vector = [0, 0];
global.hat_outline = [];
global.adjacency_radius = 1;
global.isGameRunning = false;
global.is3DMode = false;
global.score = 0;
global.updateScore = jest.fn();
global.handleGameOver = jest.fn();
global.tileArr = null;
global.exploredColour = '#ff0000';
global.unexploredColour = '#0000ff';
global.selectedColour = '#00ff00';
global.explored3DColour = '#ff00ff';


global.flagSprite = { width: 50, height: 50 };
global.mineSprite = { width: 50, height: 50 };
global.spriteImages2D = [{}];
global.spriteImages3D = [{}];
global.selectImage = jest.fn(() => 0);


global.push = jest.fn();
global.pop = jest.fn();
global.noStroke = jest.fn();
global.textFont = jest.fn();
global.textStyle = jest.fn();
global.BOLD = 'bold';
global.black_colour = 'black';
global.translate = jest.fn();
global.color = jest.fn((...args) => ({
  levels: args
}));
global.red = jest.fn(() => 50);
global.green = jest.fn(() => 150); 
global.blue = jest.fn(() => 200);
global.alpha = jest.fn(() => 255);
