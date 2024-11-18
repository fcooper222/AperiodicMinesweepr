let to_screen = [20, 0, 0, 0, -20, 0];
let translation_vector = [1, 0, 0, 0, 1, 0];
let scaleFactor = 10;
let lw_scale = 1;
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

let dragging = false;
let uibox = true;
let box_height = 10;

let height_ratio = 0.75;
let width_ratio = 0.5;
let adjaceny_radius = 56;

let svg_serial = 0;

const cols = {};
let black;
let red;
function getSVGID() {
  const ret = "t" + String(svg_serial).padStart(5, "0");
  ++svg_serial;
  return ret;
}
//legacy draw function
function drawPolygon(shape, T, f, s, w) {
  // if (f != null) {
  //   fill(f);
  // } else {
  //   noFill();
  // }
  // if (s != null) {
  //   if (s != null) {
  //     stroke(s);
  //     strokeWeight(w * lw_scale);
  //   } else {
  //     noStroke();
  //   }
  // } else {
  //   noStroke();
  // }

  // beginShape();
  // for (let p of shape) {
  //   const tp = transPt(T, p);
  //   vertex(tp.x, tp.y);
  // }

  // endShape(CLOSE);
  return;
}

function decideColour(tile) {
  //case for determining what to fill a tile in, characteristics include, whether or not it is seleceted, whether or not it has been explored
  if (tile.selected && !tile.is_explored) {
    return selectedColour;
  } else if (tile.is_explored) {
    return exploredColour;
  } else return unexploredColour;
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

// The base level of the scene, a single hat tile, including a label
// for colouring
class HatTile {
  constructor(label, x = null, y = null) {
    this.label = label;
    this.svg_id = null;
    this.color = red;
  }

  draw(S, level) {
    if (this.x == null) {
      this.setXPos(S[2]);
      this.setYPos(S[5]);
    }
    drawPolygon(hat_outline, S, cols[this.label].color(), black, 1);
  }

  setXPos(pos) {
    this.x = pos;
  }
  setYPos(pos) {
    this.y = pos;
  }

  resetSVG() {
    this.svg_id = null;
  }

  buildSVGDefs(stream, sc) {
    if (this.svg_id != null) {
      return;
    }

    this.svg_id = getSVGID();
    stream.push(
      polygonToSVG(
        hat_outline,
        this.svg_id,
        cols[this.label].color(),
        black,
        lw_scale / sc
      )
    );
  }

  getSVGStrokeID() {
    return null;
  }

  getSVGFillID() {
    return this.svg_id;
  }

  getText(stream, T) {
    // Write out the top two rows of an affine transformation matrix
    // giving the location of this hat, together with the type of
    // this tile.
    stream.push(
      `${this.label} ${T[0]} ${T[1]} ${T[2]} ${T[3]} ${T[4]} ${T[5]}`
    );
  }
}

// A group that collects a list of transformed children and an outline
class MetaTile {
  constructor(shape, width) {
    this.shape = shape;
    this.width = width;
    this.children = [];
    this.svg_id = null;
  }

  addChild(T, geom) {
    this.children.push({ T: T, geom: geom });
  }

  evalChild(n, i) {
    return transPt(this.children[n].T, this.children[n].geom.shape[i]);
  }

  draw(S, level) {
    if (level > 0) {
      for (let g of this.children) {
        g.geom.draw(mul(S, g.T), level - 1);
      }
    } else {
      drawPolygon(this.shape, S, null, red, this.width);
    }
  }

  recentre() {
    let cx = 0;
    let cy = 0;
    for (let p of this.shape) {
      cx += p.x;
      cy += p.y;
    }
    cx /= this.shape.length;
    cy /= this.shape.length;
    const tr = pt(-cx, -cy);

    for (let idx = 0; idx < this.shape.length; ++idx) {
      this.shape[idx] = padd(this.shape[idx], tr);
    }

    const M = ttrans(-cx, -cy);
    for (let ch of this.children) {
      ch.T = mul(M, ch.T);
    }
  }
  getText(stream, T) {
    for (let g of this.children) {
      g.geom.getText(stream, mul(T, g.T));
    }
  }
}

function buildTileArray(tile_tree, level) {
  //use the tiles when pressing build super tiles.
  tileArr.clear();
  S = [20, 0, 0, 0, -20, 0];
  //start on top. add recursively for everything you encounter,
  //check if it is a metatile or a hattile,
  //then take the transformation associated with it and define a new hattile with this transformation,
  //then add this newly defined tile to its associated tile array.
  addToArray(S, tile_tree, level);
  tile_tree = null;
}

function addToArray(S, node, level) {
  //add element
  // it is a meta tile which ALWAYS has children, so call recusive
  //tileArr.add(node, "meta");
  for (let g of node.children) {
    if (g.geom.constructor.name == "HatTile") {
      //found add at to tiles.
      centre = findCentreOfShape(hat_outline, mul(S, g.T));

      tileArr.add(new Tile(centre, mul(S, g.T), getRotation(mul(S, g.T))));
    } else {
      addToArray(mul(S, g.T), g.geom, level - 1);
    }
  }

  return;
}

const H1_hat = new HatTile("H1");
const H_hat = new HatTile("H");
const T_hat = new HatTile("T");
const P_hat = new HatTile("P");
const F_hat = new HatTile("F");

const H_init = (function () {
  const H_outline = [
    pt(0, 0),
    pt(4, 0),
    pt(4.5, hr3),
    pt(2.5, 5 * hr3),
    pt(1.5, 5 * hr3),
    pt(-0.5, hr3),
  ];
  const meta = new MetaTile(H_outline, 2);

  meta.addChild(
    matchTwo(hat_outline[5], hat_outline[7], H_outline[5], H_outline[0]),
    H_hat
  );
  meta.addChild(
    matchTwo(hat_outline[9], hat_outline[11], H_outline[1], H_outline[2]),
    H_hat
  );
  meta.addChild(
    matchTwo(hat_outline[5], hat_outline[7], H_outline[3], H_outline[4]),
    H_hat
  );
  meta.addChild(
    mul(
      ttrans(2.5, hr3),
      mul([-0.5, -hr3, 0, hr3, -0.5, 0], [0.5, 0, 0, 0, -0.5, 0])
    ),
    H1_hat
  );

  return meta;
})();

const T_init = (function () {
  const T_outline = [pt(0, 0), pt(3, 0), pt(1.5, 3 * hr3)];
  const meta = new MetaTile(T_outline, 2);

  meta.addChild([0.5, 0, 0.5, 0, 0.5, hr3], T_hat);

  return meta;
})();

const P_init = (function () {
  const P_outline = [pt(0, 0), pt(4, 0), pt(3, 2 * hr3), pt(-1, 2 * hr3)];
  const meta = new MetaTile(P_outline, 2);

  meta.addChild([0.5, 0, 1.5, 0, 0.5, hr3], P_hat);
  meta.addChild(
    mul(
      ttrans(0, 2 * hr3),
      mul([0.5, hr3, 0, -hr3, 0.5, 0], [0.5, 0.0, 0.0, 0.0, 0.5, 0.0])
    ),
    P_hat
  );

  return meta;
})();

const F_init = (function () {
  const F_outline = [
    pt(0, 0),
    pt(3, 0),
    pt(3.5, hr3),
    pt(3, 2 * hr3),
    pt(-1, 2 * hr3),
  ];
  const meta = new MetaTile(F_outline, 2);

  meta.addChild([0.5, 0, 1.5, 0, 0.5, hr3], F_hat);
  meta.addChild(
    mul(
      ttrans(0, 2 * hr3),
      mul([0.5, hr3, 0, -hr3, 0.5, 0], [0.5, 0.0, 0.0, 0.0, 0.5, 0.0])
    ),
    F_hat
  );

  return meta;
})();

function constructPatch(H, T, P, F) {
  const rules = [
    ["H"],
    [0, 0, "P", 2],
    [1, 0, "H", 2],
    [2, 0, "P", 2],
    [3, 0, "H", 2],
    [4, 4, "P", 2],
    [0, 4, "F", 3],
    [2, 4, "F", 3],
    [4, 1, 3, 2, "F", 0],
    [8, 3, "H", 0],
    [9, 2, "P", 0],
    [10, 2, "H", 0],
    [11, 4, "P", 2],
    [12, 0, "H", 2],
    [13, 0, "F", 3],
    [14, 2, "F", 1],
    [15, 3, "H", 4],
    [8, 2, "F", 1],
    [17, 3, "H", 0],
    [18, 2, "P", 0],
    [19, 2, "H", 2],
    [20, 4, "F", 3],
    [20, 0, "P", 2],
    [22, 0, "H", 2],
    [23, 4, "F", 3],
    [23, 0, "F", 3],
    [16, 0, "P", 2],
    [9, 4, 0, 2, "T", 2],
    [4, 0, "F", 3],
  ];

  ret = new MetaTile([], H.width);
  shapes = { H: H, T: T, P: P, F: F };

  for (let r of rules) {
    if (r.length == 1) {
      ret.addChild(ident, shapes[r[0]]);
    } else if (r.length == 4) {
      const poly = ret.children[r[0]].geom.shape;
      const T = ret.children[r[0]].T;
      const P = transPt(T, poly[(r[1] + 1) % poly.length]);
      const Q = transPt(T, poly[r[1]]);
      const nshp = shapes[r[2]];
      const npoly = nshp.shape;

      ret.addChild(
        matchTwo(npoly[r[3]], npoly[(r[3] + 1) % npoly.length], P, Q),
        nshp
      );
    } else {
      const chP = ret.children[r[0]];
      const chQ = ret.children[r[2]];

      const P = transPt(chQ.T, chQ.geom.shape[r[3]]);
      const Q = transPt(chP.T, chP.geom.shape[r[1]]);
      const nshp = shapes[r[4]];
      const npoly = nshp.shape;

      ret.addChild(
        matchTwo(npoly[r[5]], npoly[(r[5] + 1) % npoly.length], P, Q),
        nshp
      );
    }
  }

  return ret;
}

function constructMetatiles(patch) {
  const bps1 = patch.evalChild(8, 2);
  const bps2 = patch.evalChild(21, 2);
  const rbps = transPt(rotAbout(bps1, (-2.0 * PI) / 3.0), bps2);

  const p72 = patch.evalChild(7, 2);
  const p252 = patch.evalChild(25, 2);

  const llc = intersect(bps1, rbps, patch.evalChild(6, 2), p72);
  let w = psub(patch.evalChild(6, 2), llc);

  const new_H_outline = [llc, bps1];
  w = transPt(trot(-PI / 3), w);
  new_H_outline.push(padd(new_H_outline[1], w));
  new_H_outline.push(patch.evalChild(14, 2));
  w = transPt(trot(-PI / 3), w);
  new_H_outline.push(psub(new_H_outline[3], w));
  new_H_outline.push(patch.evalChild(6, 2));

  const new_H = new MetaTile(new_H_outline, patch.width * 2);
  for (let ch of [0, 9, 16, 27, 26, 6, 1, 8, 10, 15]) {
    new_H.addChild(patch.children[ch].T, patch.children[ch].geom);
  }

  const new_P_outline = [p72, padd(p72, psub(bps1, llc)), bps1, llc];
  const new_P = new MetaTile(new_P_outline, patch.width * 2);
  for (let ch of [7, 2, 3, 4, 28]) {
    new_P.addChild(patch.children[ch].T, patch.children[ch].geom);
  }

  const new_F_outline = [
    bps2,
    patch.evalChild(24, 2),
    patch.evalChild(25, 0),
    p252,
    padd(p252, psub(llc, bps1)),
  ];
  const new_F = new MetaTile(new_F_outline, patch.width * 2);
  for (let ch of [21, 20, 22, 23, 24, 25]) {
    new_F.addChild(patch.children[ch].T, patch.children[ch].geom);
  }

  const AAA = new_H_outline[2];
  const BBB = padd(new_H_outline[1], psub(new_H_outline[4], new_H_outline[5]));
  const CCC = transPt(rotAbout(BBB, -PI / 3), AAA);
  const new_T_outline = [BBB, CCC, AAA];
  const new_T = new MetaTile(new_T_outline, patch.width * 2);
  new_T.addChild(patch.children[11].T, patch.children[11].geom);

  new_H.recentre();
  new_P.recentre();
  new_F.recentre();
  new_T.recentre();

  return [new_H, new_T, new_P, new_F];
}

function isButtonActive(but) {
  return but.elt.style.border.length > 0;
}

function setButtonActive(but, b) {
  but.elt.style.border = b ? "3px solid black" : "";
}

function addButton(name, f) {
  const ret = createButton(name);
  ret.position(10, box_height);
  ret.size(125, 25);
  ret.mousePressed(f);
  box_height += 30;

  return ret;
}

function setup() {
  tileArr = new TileArray();
  windowWidth, windowHeight;
  const canvasWidth = windowWidth * width_ratio;
  const canvasHeight = windowHeight * height_ratio;
  createCanvas(canvasWidth, canvasHeight);
  tiles = [H_init, T_init, P_init, F_init];
  level = 1;

  black = color("black");
  red = color("red");
  unexploredColour = color(244, 220, 180);
  selectedColour = color(255, 230, 200);
  exploredColour = color(200, 160, 140);

  reset_button = addButton("Reset", function () {
    tiles = [H_init, T_init, P_init, F_init];
    level = 1;
    translation_vector = [1, 0, 0, 0, -1, 0];
    tileArr.changeSelected(null);
    tileArr.clear();
    loop();
  });
  subst_button = addButton("Build Supertiles", function () {
    const patch = constructPatch(...tiles);
    tiles = constructMetatiles(patch);
    const idx = { H: 0, T: 1, P: 2, F: 3 }[radio.value()];
    buildTileArray(tiles[idx], level);
    print(tileArr.getTiles());
    ++level;
    loop();
  });
  box_height += 10;

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
  box_height += 40;
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
    drawShape(tile);
  }
  pop();
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
  const canvasWidth = windowWidth * width_ratio;
  const canvasHeight = windowHeight * height_ratio;
  //create mousept coordinates in relation to the centre of the canvas, origin should be in centre not the top left (ew)
  const mousePt = {
    x: mouseX - canvasWidth / 2,
    y: mouseY - canvasHeight / 2,
  };
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
  const canvasWidth = windowWidth * width_ratio;
  const canvasHeight = windowHeight * height_ratio;
  //same thing as seen above, could put this in a single function but i cba
  const mousePt = {
    x: mouseX - canvasWidth / 2,
    y: mouseY - canvasHeight / 2,
  };
  const closest = tileArr.findClosestTile(mousePt);
  if (closest) {
    tileArr.changeSelected(closest);
  }
}
