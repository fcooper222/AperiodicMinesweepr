let explosionImages = [];
let explosions = [];

class Explosion {
  constructor(x, y, speed) {
    this.sprites = explosionImages;
    this.x = x - this.sprites[0].width / 2;
    this.y = y - this.sprites[0].height / 2;
    this.speed = speed;
    this.index = 0.0;
  }
  draw() {
    // Adjust the coordinates to match the translated canvas
    image(
      this.sprites[floor(this.index) % this.sprites.length],
      this.x,
      this.y
    );
  }

  update() {
    this.index += this.speed;
  }

  reset() {
    this.index = 0.0;
  }

  isOver() {
    return this.index >= this.sprites.length;
  }
}

function loadExplosionPixels() {
  explosionSpriteSheet.loadPixels();
  console.log(explosionSpriteSheet.pixels.length);

  explosionImages.push(explosionSpriteSheet.get(1, 1, 89, 89));
  explosionImages.push(explosionSpriteSheet.get(93, 1, 89, 89));
  explosionImages.push(explosionSpriteSheet.get(185, 1, 89, 89));
  explosionImages.push(explosionSpriteSheet.get(277, 1, 89, 89));
  explosionImages.push(explosionSpriteSheet.get(369, 1, 89, 89));

  explosionImages.push(explosionSpriteSheet.get(1, 93, 89, 89));
  explosionImages.push(explosionSpriteSheet.get(93, 93, 89, 89));
  explosionImages.push(explosionSpriteSheet.get(185, 93, 89, 89));
  explosionImages.push(explosionSpriteSheet.get(277, 93, 89, 89));
  explosionImages.push(explosionSpriteSheet.get(369, 93, 89, 89));
  noSmooth();
}

function triggerExplosion(pt) {
  console.log("ptxy", pt.x, pt.y);
  explosions.push(new Explosion(pt.x, pt.y, 0.25));
}

function drawExplosions() {
  explosions.forEach((explosion) => {
    explosion.draw();
    explosion.update();
  });

  explosions = explosions.filter((explosion) => !explosion.isOver());
}
