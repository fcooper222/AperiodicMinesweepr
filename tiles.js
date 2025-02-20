const distance_threshold = 0.01; // Adjust as needed
const mine_frequency = 0.2;

class Tile {
  constructor(centre, trans,edge_tracking = false) {
    this.centre = centre;
    this.trans = trans;
    this.is_mine = Math.random() < mine_frequency;
    this.image_idx = selectImage(this.trans)
    this.is_explored = false;
    this.adjacency_number = null;
    this.flagged = false;
  
    if (edge_tracking){
      //tile has 12 edges, initially set each to be 0, representign all edges have no matched tile
      this.edges = [0,0,0,0,0,0,0,0,0,0,0,0];

    };
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
    this.n_tiles=[];
    this.selected_tile = null;
    this.game_score = 0;
    this.flagged_mines = 0;
  }

  changeSelected(tile) {
    //set new tile to be selected and remove old tile here
    this.selected_tile=tile;
  }

  add(tile,arr=this.hat_tiles) {
    //instructive name, only used for calling binaryadd in a more memorable way
    const index = this.binaryAdd(tile, arr);
    arr.splice(index, 0, tile);
  }

  remove(tile, arr=this.hat_tiles) {
    const index = this.binaryFind(tile, arr);
    
    if (index !== -1) {
        arr.splice(index, 1);
    }
  }
  setDifficulty(difficulty){
    
  }

  binaryAdd(tile,arr=hat_tiles) {
    let low = 0;
    let high = arr.length;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const comparison = this.compare(arr[mid], tile);

      if (comparison < 0) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }

  binaryFind(tile, arr=this.hat_tiles) {
    let low = 0;
    let high = arr.length;

    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        const comparison = this.compare(arr[mid], tile);
        
        if (comparison === 0) {
            // Found exact match
            return mid;
        } else if (comparison < 0) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    
    // Item not found
    return -1;
}



  buildNRings(init_tile,rings=5){

    let inner_tiles = []; //contains the inner tiles in the array that are always considered valid
    let outer_tiles = [init_tile]; //contains the outer tiles in the array that are valid, yet should be added to
    let new_outer_tiles = []; //array of the new tiles being added to the current outer tiles.
    this.add(init_tile, outer_tiles);
    for (let i;i<rings;i++){
    while (outer_tiles.some(tile => tile.edges.includes(0))){
      let outer_tile = this.getRandomOpenTile(outer_tiles)
      let trans = this.chooseValidTransformTo(outer_tile);
      let tempTrans = mul(outer_tile.trans,trans);
      if (this.checkIfTileValid(tempTrans)){
        //tile is valid, add it to the surrounding tiles.

        //make new tile, then add it to the array

        this.updateSurroundingEdges();
      }
    }

    //all outer tiles have been covered;
    inner_tiles.push(...outer_tiles);
    outer_tiles = [...new_outer_tiles];
    new_outer_tiles = [];
  }

  inner_tiles.push(...outer_tiles);

  return inner_tiles;
  }

  buildNTiles(init_tile, rings=10) {
    let n_tiles = [init_tile];
    const usedTransforms = new Map();
    usedTransforms.set(0, new Set());
    while (n_tiles.length < n) {
        const randomTileIndex = Math.floor(Math.random() * n_tiles.length);
        const selectedTile = n_tiles[randomTileIndex];
        let validTransformFound = false;
 
        if (!usedTransforms.has(randomTileIndex)) {
            usedTransforms.set(randomTileIndex, new Set());
        }
 
        const indices = Array.from({length: local_hat_transforms.length}, (_, i) => i)
            .filter(i => !usedTransforms.get(randomTileIndex).has(i));
        
        for (const transformIndex of indices) {
            const transform = local_hat_transforms[transformIndex];
            let newTrans = mul(selectedTile.trans, transform);
            let newCentre = findCentreOfShape(hat_outline, newTrans);
            let isValid = true;
 
            let nearby_tiles = this.rangeSearch(newCentre.x-10000, newCentre.x+10000, 
                                              newCentre.y-10000, newCentre.y+10000, n_tiles);
 
            for (const existingTile of nearby_tiles) {
                let distance = Math.hypot(existingTile.centre.x - newCentre.x, 
                                        existingTile.centre.y - newCentre.y);
                if (distance < 50 || this.checkForOverlap(existingTile.trans, newTrans)) {
                    isValid = false;
                    break;
                }
            }
 
            if (isValid) {
                n_tiles.push(new Tile(newCentre, newTrans));
                usedTransforms.get(randomTileIndex).add(transformIndex);
                validTransformFound = true;
                break;
            }
        }
 
        if (!validTransformFound && usedTransforms.get(randomTileIndex).size === local_hat_transforms.length) {
            n_tiles.splice(randomTileIndex, 1);
            usedTransforms.delete(randomTileIndex);
        }
    }
    return n_tiles;
 }

  //this method uses the spatial grid algorithm, copied from stack overflow to fit my specs, not sure exactly how it works yet but it does so i wont touch it.
  findClosestTile(clickPt,arr=this.hat_tiles) {
    let tcpt = clickPt;
    let filtered_tiles = this.rangeSearch(
      tcpt.x - 60,
      tcpt.x + 60,
      tcpt.y - 60,
      tcpt.y + 60,arr
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
      c.x - adjacency_radius,
      c.x + adjacency_radius,
      c.y - adjacency_radius,
      c.y + adjacency_radius
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

  firstInRange(xMin,arr=this.hat_tiles) {
    let low = 0;
    let high = arr.length;
    let operation_count = 0;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const tile = arr[mid];

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
        if (tile.is_mine){
          this.flagged_mines--;
        }
      } else {
        //add to array.
        this.flagged_tiles.push(tile)
        if (tile.is_mine){
          this.flagged_mines++;
        }
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
        }
      }
    }
    }
  }
  mineTriggered() {
    //function that is called when a mine is stepped on

    
    handleGameOver(this.flagged_mines);
  }
  // find first tile within a ceratin range using a binary search, then linear add all of the tiles in the range until no more can be.
  rangeSearch(xMin, xMax, yMin, yMax,arr=this.hat_tiles) {
    const result = [];
    let startIndex = this.firstInRange(xMin,arr);

    for (let i = startIndex; i < arr.length; i++) {
      const tile = arr[i];

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
    this.flagged_mines = 0;
  }
}
