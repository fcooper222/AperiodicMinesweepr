// file that contains the methods for building the tile arrays.
function drawPolygon(shape, T, f, s, w) {
    return;
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

class HatTile {
    constructor(label, x = null, y = null) {
      this.label = label;
      this.svg_id = null;
      this.color = null;
    }
  
    draw(S, level) {
      if (this.x == null) {
        this.setXPos(S[2]);
        this.setYPos(S[5]);
      }
    //   drawPolygon(hat_outline, S, cols[this.label].color(), black, 1);
    }
  
    setXPos(pos) {
      this.x = pos;
    }
    setYPos(pos) {
      this.y = pos;
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
        // drawPolygon(this.shape, S, null, red, this.width);
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
        tileArr.add(new Tile(centre, mul(S, g.T), g.geom.label));
      } else {
        addToArray(mul(S, g.T), g.geom, level - 1);
      }
    }
  
    return;
  }


const H1_hat = new HatTile("H1");
const H2_hat = new HatTile("H2");
const H3_hat = new HatTile("H3");
const H4_hat = new HatTile("H4");


const H_hat = new HatTile("H");
const T_hat = new HatTile("T");
const P_hat = new HatTile("P");

const P1_hat = new HatTile("P1");
const P2_hat = new HatTile("P2");
const F_hat = new HatTile("F");

const F1_hat = new HatTile("F1");
const F2_hat = new HatTile("F2");


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
  //h3
  meta.addChild(
    matchTwo(hat_outline[5], hat_outline[7], H_outline[5], H_outline[0]),
    H3_hat
  );
  //h2
  meta.addChild(
    matchTwo(hat_outline[9], hat_outline[11], H_outline[1], H_outline[2]),
    H2_hat
  );
  //h4
  meta.addChild(
    matchTwo(hat_outline[5], hat_outline[7], H_outline[3], H_outline[4]),
    H4_hat
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

  meta.addChild([0.5, 0, 1.5, 0, 0.5, hr3], P2_hat);
  meta.addChild(
    mul(
      ttrans(0, 2 * hr3),
      mul([0.5, hr3, 0, -hr3, 0.5, 0], [0.5, 0.0, 0.0, 0.0, 0.5, 0.0])
    ),
    P1_hat
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

  meta.addChild([0.5, 0, 1.5, 0, 0.5, hr3], F2_hat);
  meta.addChild(
    mul(
      ttrans(0, 2 * hr3),
      mul([0.5, hr3, 0, -hr3, 0.5, 0], [0.5, 0.0, 0.0, 0.0, 0.5, 0.0])
    ),
    F1_hat
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