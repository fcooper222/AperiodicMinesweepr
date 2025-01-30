const distance_threshold = 0.01; // Adjust as needed
const mine_frequency = 0.2;

class Tile {
  constructor(centre, trans) {
    this.centre = centre;
    this.trans = trans;
    this.is_mine = Math.random() < 0.2;
    this.image_idx = selectImage(this.trans)
    this.is_explored = false;
    this.adjacency_number = null;
    this.flagged = false;
  }

  setXPos(pos) {
    this.centre.x = pos;
  }
  setYPos(pos) {
    this.centre.y = pos;
  }
  setAdjacencyNumber(num) {
    this.adjacency_number = num;
  }
  explore(num = 0) {
    this.is_explored = true;
    this.setAdjacencyNumber(num);
  }
  setColour(colour) {
    this.colour = colour;
  }
  changeFlagged() {
    this.flagged = !this.flagged;
  }

}

class TileArray {
  constructor() {
    this.hat_tiles = [];
    this.flagged_tiles=[];
    this.selected_tile = null;
    this.game_score = 0;
  }

  changeSelected(tile) {
    //set new tile to be selected and remove old tile here
    this.selected_tile=tile;

  }

  add(tile) {
    //instructive name, only used for calling binaryadd in a more memorable way
    const index = this.binaryAdd(tile, this.hat_tiles);
    this.hat_tiles.splice(index, 0, tile);
  }

  binaryAdd(tile) {
    let low = 0;
    let high = this.hat_tiles.length;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const comparison = this.compare(this.hat_tiles[mid], tile);

      if (comparison < 0) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }

  //this method uses the spatial grid algorithm, copied from stack overflow to fit my specs, not sure exactly how it works yet but it does so i wont touch it.
  findClosestTile(clickPt) {
    let tcpt = clickPt;
    let filtered_tiles = this.rangeSearch(
      tcpt.x - 20,
      tcpt.x + 20,
      tcpt.y - 20,
      tcpt.y + 20
    );

    let closest = null;
    let mdist = Infinity;
    for (let tile of filtered_tiles) {
      const tc = transPt(translation_vector, tile.centre);
      const dx = tcpt.x - tc.x;
      const dy = tcpt.y - tc.y;
      const distance = dx * dx + dy * dy;

      if (distance < mdist) {
        mdist = distance;
        closest = tile;
      }
    }
    return closest;
  }

  distanceSquared(point1, point2) {
    return Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2);
  }

  createSpatialGrid(points, cellSize) {
    const grid = new Map();
    for (let pt of points) {
      const cellKey = this.getCellKey(pt, cellSize);
      if (!grid.has(cellKey)) grid.set(cellKey, []);
      grid.get(cellKey).push(pt);
    }
    return grid;
  }

  getCellKey(point, cellSize) {
    const x = Math.floor(point.x / cellSize);
    const y = Math.floor(point.y / cellSize);
    return `${x},${y}`;
  }

  hasClosePoints(set1, set2, threshold) {
    const thresholdSquared = Math.pow(threshold, 2);
    const cellSize = threshold;
    const grid = this.createSpatialGrid(set1, cellSize);

    for (let pt2 of set2) {
      const cellKey = this.getCellKey(pt2, cellSize);

      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const neighborKey = `${+cellKey.split(",")[0] + dx},${
            +cellKey.split(",")[1] + dy
          }`;
          if (grid.has(neighborKey)) {
            for (let pt1 of grid.get(neighborKey)) {
              if (this.distanceSquared(pt1, pt2) < thresholdSquared) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  findAdjacentTo(tile) {
    let c = transPt(translation_vector, tile.centre);
    let adjacent_tiles = this.rangeSearch(
      c.x - adjaceny_radius,
      c.x + adjaceny_radius,
      c.y - adjaceny_radius,
      c.y + adjaceny_radius
    );
    //set of current hat pts
    let baseHatPts = hat_outline.map((p) =>
      transPt(mul(translation_vector, tile.trans), p)
    );
    let out_tiles = [];
    for (let adjtile of adjacent_tiles) {
      let adjHatPts = hat_outline.map((p) =>
        transPt(mul(translation_vector, adjtile.trans), p)
      );
      // due to floating point errors we need a threshold because often points are within 0.0001 units of eachother but arent techniically equal
      if (this.hasClosePoints(baseHatPts, adjHatPts, distance_threshold)) {
        out_tiles.push(adjtile);
      }
    }
    return out_tiles;
  }

  firstInRange(xMin) {
    let low = 0;
    let high = this.hat_tiles.length;
    let operation_count = 0;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const tile = this.hat_tiles[mid];

      const transformedCentre = transPt(translation_vector, tile.centre);

      if (transformedCentre.x < xMin) {
        low = mid + 1;
        operation_count++;
      } else {
        high = mid;
        operation_count++;
      }
    }
    return low;
  }

  handleInteraction(tile, flagMode = false) {
    if (flagMode == true) {
      if (tile.flagged){
        //remove from array
        this.flagged_tiles = this.flagged_tiles.filter(flaggedTile => flaggedTile !== tile);
      } else {
        //add to array.
        this.flagged_tiles.push(tile)
      }

      tile.changeFlagged();
    } else {
      // first of all check if tile is a mine
      if (!tile.flagged){
      if (tile.is_mine) {
        //tile is mine, initiate destruct sequence.
        this.mineTriggered();
      } else {
        //tile is NOT a mine
        updateScore(score + 1);
        let adjacent_tiles = this.findAdjacentTo(tile);
        let mineCount = adjacent_tiles.filter((tile) => tile.is_mine).length;
        if (mineCount === 0) {
          //no mines around the current tile, run this function on each of the surrounding tiles
          tile.explore();
          for (let adjtile of adjacent_tiles) {
            if (!adjtile.is_explored) {
              this.handleInteraction(adjtile);
            }
          }
        } else {
          //mines around current tile
          tile.explore(mineCount);
          console.log("mine");
        }
      }
    }
    }
  }
  mineTriggered() {
    //function that is called when a mine is stepped on

    console.log("BOOOOM!");
  }
  // find first tile within a ceratin range using a binary search, then linear add all of the tiles in the range until no more can be.
  rangeSearch(xMin, xMax, yMin, yMax) {
    const result = [];
    let startIndex = this.firstInRange(xMin);

    for (let i = startIndex; i < this.hat_tiles.length; i++) {
      const tile = this.hat_tiles[i];

      const transformedCentre = transPt(translation_vector, tile.centre);

      if (transformedCentre.x >= xMax) {
        break;
      }

      if (transformedCentre.y > yMin && transformedCentre.y < yMax) {
        result.push(tile);
      }
    }

    return result;
  }

  compare(tile1, tile2) {
    if (tile1.centre.x === tile2.centre.x) {
      return tile1.centre.y - tile2.centre.y;
    }
    return tile1.centre.x - tile2.centre.x;
  }

  getTiles() {
    return this.hat_tiles;
  }

  clear() {
    this.hat_tiles = [];
    this.flagged_tiles=[];
  }
}
