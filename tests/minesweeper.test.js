const { Tile, TileArray } = require('../src/tiles.js');
const { decideColour } = require('../src/hat.js');
const { 
  pt, hexPt, inv, mul, matrixTo, padd, psub, trot, 
  getRotation, ttrans, rotAbout, transPt, matchSeg,
  matchTwo, intersect
} = require('../src/geometry.js');

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  
  global.tileArr = new TileArray();
  global.translation_vector = [1, 0, 0, 0, 1, 0];
});
  
  describe('Tile Class', () => {
    test('constructor initializes properties correctly', () => {
      const centre = { x: 100, y: 100 };
      const trans = [1, 0, 0, 0, 1, 0];
      const label = 'testTile';
      
  
      
      // Mock selectImage function
      global.selectImage = jest.fn(() => 0);
      
      const tile = new Tile(centre, trans, label);
      
      expect(tile.centre).toBe(centre);
      expect(tile.trans).toBe(trans);
      expect(tile.label).toBe(label);
      expect(tile.is_mine).toBe(false);
      expect(tile.is_explored).toBe(false);
      expect(tile.adjacency_number).toBeNull();
      expect(tile.flagged).toBe(false);
      
    });
    
    test('explore method sets tile as explored', () => {
      const tile = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'testTile');
      
      tile.explore(3);
      
      expect(tile.is_explored).toBe(true);
      expect(tile.adjacency_number).toBe(3);
    });
    
    test('changeFlagged toggles flagged property', () => {
      const tile = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'testTile');
      
      expect(tile.flagged).toBe(false);
      
      tile.changeFlagged();
      expect(tile.flagged).toBe(true);
      
      tile.changeFlagged();
      expect(tile.flagged).toBe(false);
    });
  });
  
  describe('TileArray Class', () => {
    test('constructor initializes properties correctly', () => {
      const tileArray = new TileArray();
      
      expect(tileArray.hat_tiles).toEqual([]);
      expect(tileArray.flagged_tiles).toEqual([]);
      expect(tileArray.selected_tile).toBeNull();
      expect(tileArray.game_score).toBe(0);
      expect(tileArray.flagged_mines).toBe(0);
    });
    
    test('add method adds tile to array', () => {
      const tileArray = new TileArray();
      const tile = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'testTile');
      
      // Mock binaryAdd to return a specific index
      tileArray.binaryAdd = jest.fn(() => 0);
      
      tileArray.add(tile);
      
      expect(tileArray.binaryAdd).toHaveBeenCalledWith(tile, tileArray.hat_tiles);
      expect(tileArray.hat_tiles).toContain(tile);
    });
    
    test('remove method removes tile from array', () => {
      const tileArray = new TileArray();
      const tile = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'testTile');
      
      // Mock binaryFind to return a index 1
      tileArray.binaryFind = jest.fn(() => 0);
      
      tileArray.hat_tiles.push(tile);
      
      tileArray.remove(tile);
      
      expect(tileArray.binaryFind).toHaveBeenCalledWith(tile, tileArray.hat_tiles);
      expect(tileArray.hat_tiles).not.toContain(tile);
    });
    
    test('changeSelected updates selected_tile', () => {
      const tileArray = new TileArray();
      const tile = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'testTile');
      
      tileArray.changeSelected(tile);
      expect(tileArray.selected_tile).toBe(tile);
      
      tileArray.changeSelected(null);
      expect(tileArray.selected_tile).toBeNull();
    });
    
    test('handleInteraction with non-mine tile explores it', () => {
      const tileArray = new TileArray();
      const tile = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'testTile');
      tile.is_mine = false;
      
      // Mock findAdjacentTo to return empty array (no adjacent tiles)
      tileArray.findAdjacentTo = jest.fn(() => []);
      
      tileArray.handleInteraction(tile, false);
      
      expect(updateScore).toHaveBeenCalled();
      expect(tile.is_explored).toBe(true);
    });
    
    test('handleInteraction with mine triggers game over', () => {
      const tileArray = new TileArray();
      const tile = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'testTile');
      tile.is_mine = true;
      
      tileArray.handleInteraction(tile, false);
      
      expect(handleGameOver).toHaveBeenCalled();
    });
    
    test('handleInteraction in flag mode toggles flag', () => {
      const tileArray = new TileArray();
      const tile = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'testTile');
      tile.is_mine = true;
      
      tileArray.handleInteraction(tile, true);
      
      expect(tile.flagged).toBe(true);
      expect(tileArray.flagged_tiles).toContain(tile);
      expect(tileArray.flagged_mines).toBe(1);
      
      tileArray.handleInteraction(tile, true);
      
      expect(tile.flagged).toBe(false);
      expect(tileArray.flagged_tiles).not.toContain(tile);
      expect(tileArray.flagged_mines).toBe(0);
    });
    
    test('findClosestTile returns the nearest tile to a point', () => {
      const tileArray = new TileArray();
      const tile1 = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'H1');
      const tile2 = new Tile({ x: 200, y: 200 }, [1, 0, 0, 0, 1, 0], 'H2');
      tileArray.add(tile1);
      tileArray.add(tile2);
      // Mock rangeSearch to return our test tiles
      global.translation_vector = [1,0,0,0,1,0];

      tileArray.rangeSearch = jest.fn(() => [tile1, tile2]);
      const result = tileArray.findClosestTile({ x: 110, y: 110 });
      
      expect(tileArray.rangeSearch).toHaveBeenCalled();
      expect(result).toBe(tile1); // tile1 is closer to (110, 110)
    });
    
    test('clear method resets arrays', () => {
        const tileArray = new TileArray();
        const tile = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'testTile');
        
        tileArray.hat_tiles.push(tile);
        tileArray.flagged_tiles.push(tile);
        tileArray.flagged_mines = 1;
        
        tileArray.clear();
        
        expect(tileArray.hat_tiles).toEqual([]);
        expect(tileArray.flagged_tiles).toEqual([]);
        expect(tileArray.flagged_mines).toBe(0);
      });
    });
    
    describe('UI Tests', () => {
      test('decideColour returns correct color based on tile state', () => {
        const tileArr = new TileArray();
        const exploredTile = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'explored');
        const unexploredTile = new Tile({ x: 300, y: 300 }, [1, 0, 0, 0, 1, 0], 'unexplored');
        const selectedTile = new Tile({ x: 500, y: 500 }, [1, 0, 0, 0, 1, 0], 'selected');
        
        exploredTile.explore(0);
        
        tileArr.selected_tile = selectedTile;
        global.tileArr = tileArr;
        
        expect(decideColour(exploredTile)).toBe(exploredColour);
        expect(decideColour(unexploredTile)).toBe(unexploredColour);
        expect(decideColour(selectedTile)).toBe(selectedColour);
      });
    });



    describe('Tile Class Additional Tests', () => {
      test('setMine method sets is_mine property', () => {
        const tile = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'testTile');
        
        expect(tile.is_mine).toBe(false);
        
        tile.setMine(true);
        expect(tile.is_mine).toBe(true);
        
        tile.setMine(false);
        expect(tile.is_mine).toBe(false);
      });
      
      test('getDistanceTo calculates correct distance', () => {
        const tile = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'testTile');
        const point = { x: 104, y: 103 };
        tileArr.add(tile);
        
        // Distance formula: sqrt((x2-x1)² + (y2-y1)²)
        // sqrt((104-100)² + (103-100)²) = sqrt(16 + 9) = sqrt(25) = 5
        const result = tileArr.distanceSquared(tile.centre,point);
        
        expect(result).toBe(25);
      });
    });
    
    describe('TileArray Class Additional Tests', () => {
      test('binaryFind returns correct index for existing tile', () => {
        const tileArray = new TileArray();
        const tile1 = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'tile1');
        const tile2 = new Tile({ x: 200, y: 100 }, [1, 0, 0, 0, 1, 0], 'tile2');
        const tile3 = new Tile({ x: 300, y: 100 }, [1, 0, 0, 0, 1, 0], 'tile3');
        
        tileArray.hat_tiles = [tile1, tile2, tile3];
        
        const index = tileArray.binaryFind(tile2, tileArray.hat_tiles);
        
        expect(index).toBe(1);
      });
      
      test('binaryFind returns -1 for non-existing tile', () => {
        const tileArray = new TileArray();
        const tile1 = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'tile1');
        const tile2 = new Tile({ x: 200, y: 100 }, [1, 0, 0, 0, 1, 0], 'tile2');
        
        tileArray.hat_tiles = [tile1];
        
        const index = tileArray.binaryFind(tile2, tileArray.hat_tiles);
        
        expect(index).toBe(-1);
      });
      
      test('binaryAdd inserts tile in correct sorted position', () => {
        const tileArray = new TileArray();
        const tile1 = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'tile1');
        const tile2 = new Tile({ x: 300, y: 100 }, [1, 0, 0, 0, 1, 0], 'tile3');
        const tileToInsert = new Tile({ x: 200, y: 100 }, [1, 0, 0, 0, 1, 0], 'tile2');
        
        tileArray.add(tile1);
        tileArray.add(tile2);
        
        const index = tileArray.binaryAdd(tileToInsert, tileArray.hat_tiles);
        
        expect(index).toBe(1); // Should be inserted at index 1
        expect(tileArray.hat_tiles[1]).toBe(tileToInsert);
        expect(tileArray.hat_tiles.length).toBe(3);
        expect(tileArray.hat_tiles).toEqual([tile1, tileToInsert, tile2]);
      });
      
      test('findAdjacentTo finds tiles within adjacency radius', () => {
        const tileArr = new TileArray();
        const centreTile = new Tile({ x: 200, y: 200 }, [1, 0, 0, 0, 1, 0], 'centre');
        const farTile = new Tile({ x: 3000, y: 3000 }, [1, 0, 0, 0, 1, 0], 'far'); // ~141 units away
        
        tileArr.add(centreTile);
        tileArr.add(farTile);
        
        // Mock rangeSearch to return all tiles
        tileArr.rangeSearch = jest.fn(() => [centreTile, farTile]);
        
        const adjTiles = tileArr.findAdjacentTo(centreTile);
        
        expect(adjTiles).not.toContain(farTile);
        expect(adjTiles).not.toContain(centreTile);
      });
      
      test('rangeSearch returns tiles within specified bounds', () => {
        const tileArray = new TileArray();
        const tile1 = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'tile1');
        const tile2 = new Tile({ x: 200, y: 200 }, [1, 0, 0, 0, 1, 0], 'tile2');
        const tile3 = new Tile({ x: 300, y: 300 }, [1, 0, 0, 0, 1, 0], 'tile3');
        
        tileArray.add(tile1);
        tileArray.add(tile2);
        tileArray.add(tile3);
        
        const result = tileArray.rangeSearch(50, 250, 50, 250);
        
        expect(result).toContain(tile1);
        expect(result).toContain(tile2);
        expect(result).not.toContain(tile3);
      });
      
      test('floodFill explores connected non-mine tiles', () => {
        const tileArray = new TileArray();
        const tile1 = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'tile1');
        const tile2 = new Tile({ x: 150, y: 100 }, [1, 0, 0, 0, 1, 0], 'tile2'); // Adjacent to tile1
        const tile3 = new Tile({ x: 200, y: 100 }, [1, 0, 0, 0, 1, 0], 'tile3'); // Adjacent to tile2
        const mineTile = new Tile({ x: 150, y: 150 }, [1, 0, 0, 0, 1, 0], 'mine'); // Adjacent to tile2
        
        mineTile.setMine(true);
        
        tileArray.add(tile1);
        tileArray.add(tile2);
        tileArray.add(tile3);
        tileArray.add(mineTile);
        
        // Mock findAdjacentTo
        tileArray.findAdjacentTo = jest.fn((tile) => {
          if (tile === tile1) return [tile2];
          if (tile === tile2) return [tile1, tile3, mineTile];
          if (tile === tile3) return [tile2];
          if (tile === mineTile) return [tile2];
          return [];
        });
        
        tileArray.floodFill(tile1);
        
        expect(tile1.is_explored).toBe(true);
        expect(tile2.is_explored).toBe(true);
        expect(tile3.is_explored).toBe(true);
        expect(mineTile.is_explored).toBe(false);
        expect(updateScore).toHaveBeenCalledTimes(3);
      });
      
      test('getTiles returns all tiles in hat_tiles array', () => {
        const tileArray = new TileArray();
        const tile1 = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'tile1');
        const tile2 = new Tile({ x: 200, y: 200 }, [1, 0, 0, 0, 1, 0], 'tile2');
        
        tileArray.add(tile1);
        tileArray.add(tile2);
        
        const result = tileArray.getTiles();
        
        expect(result).toEqual([tile1, tile2]);
      });
    
      test('handleInteraction explores tile with adjacent mines correctly', () => {
        const tileArray = new TileArray();
        const tile = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'testTile');
        const mineTile = new Tile({ x: 150, y: 100 }, [1, 0, 0, 0, 1, 0], 'mineTile');
        
        mineTile.setMine(true);
        
        // Mock findAdjacentTo to return the mineTile
        tileArray.findAdjacentTo = jest.fn(() => [mineTile]);
        
        tileArray.handleInteraction(tile, false);
        
        expect(tile.is_explored).toBe(true);
        expect(tile.adjacency_number).toBe(1);
        expect(updateScore).toHaveBeenCalled();
      });
      
      test('handleInteraction with flagged tile does nothing in normal mode', () => {
        const tileArray = new TileArray();
        const tile = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'testTile');
        
        tile.changeFlagged(); // Flag the tile
        tileArray.flagged_tiles.push(tile);
        
        tileArray.handleInteraction(tile, false);
        
        expect(tile.is_explored).toBe(false);
        expect(updateScore).not.toHaveBeenCalled();
      });
    });
    
    describe('UI Functions', () => {
      test('drawSpriteAt correctly draws flag sprite', () => {
        const tile = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'testTile');
        
        drawSpriteAt(tile, true);
        
        expect(image).toHaveBeenCalledWith(
          flagSprite,
          expect.any(Number),
          expect.any(Number),
          expect.any(Number),
          expect.any(Number)
        );
      });
      
      test('drawSpriteAt correctly draws mine sprite', () => {
        const tile = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'testTile');
        
        drawSpriteAt(tile, false);
        
        expect(image).toHaveBeenCalledWith(
          mineSprite,
          expect.any(Number),
          expect.any(Number),
          expect.any(Number),
          expect.any(Number)
        );
      });
    });
    
    describe('Game Logic', () => {
      test('handleFirstClick sets mines avoiding first click tile and adjacent tiles', () => {
        const tileArray = new TileArray();
        const clickedTile = new Tile({ x: 100, y: 100 }, [1, 0, 0, 0, 1, 0], 'clicked');
        const adjacentTile = new Tile({ x: 150, y: 100 }, [1, 0, 0, 0, 1, 0], 'adjacent');
        const farTile = new Tile({ x: 300, y: 300 }, [1, 0, 0, 0, 1, 0], 'far');
        
        tileArray.add(clickedTile);
        tileArray.add(adjacentTile);
        tileArray.add(farTile);
        
        // Mock findAdjacentTo and random
        tileArray.findAdjacentTo = jest.fn(() => [adjacentTile]);
        global.tileArr = tileArray;
        const originalRandom = Math.random;
        Math.random = jest.fn(() => 0.1); // Will be less than any difficulty
        global.game_difficulty = 0.2;
        
        handleFirstClick(clickedTile);
        
        expect(clickedTile.is_mine).toBe(false);
        expect(adjacentTile.is_mine).toBe(false);
        expect(farTile.is_mine).toBe(true);
        
        // Restore original Math.random
        Math.random = originalRandom;
      });
      
      test('handleGameOver calls stopTimer and saveGameEntry', () => {
        global.saveGameEntry = jest.fn();
        global.stopTimer = jest.fn();
        global.millis = jest.fn(() => 10000);
        global.start_time = 5000;
        global.score = 100;
        
        handleGameOver(5);
        
        expect(stopTimer).toHaveBeenCalled();
        expect(saveGameEntry).toHaveBeenCalledWith(100, 5, 5);
      });
    });
    
    describe('Storage Functions', () => {
      test('saveGameEntry adds entry to localStorage', () => {
        // Mock localStorage
        const mockLocalStorage = {
          getItem: jest.fn(() => JSON.stringify([])),
          setItem: jest.fn()
        };
        Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });
        
        global.updateLeaderboard = jest.fn();
        
        saveGameEntry(100, 5, 120);
        
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('gameEntries');
        expect(mockLocalStorage.setItem).toHaveBeenCalled();
        expect(updateLeaderboard).toHaveBeenCalled();
        
        // Check the saved entry
        const expectedEntries = [{ score: 100, minesFlagged: 5, time: 120 }];
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('gameEntries', JSON.stringify(expectedEntries));
      });
    });


    describe('Basic Point Functions', () => {
      test('pt creates a point with x and y coordinates', () => {
        const point = pt(3, 4);
        expect(point).toEqual({ x: 3, y: 4 });
      });
    
      test('hexPt creates a point in hexagonal coordinates', () => {
        const hr3 = 0.8660254037844386;
        const point = hexPt(2, 1);
        
        // hexPt(x, y) = pt(x + 0.5 * y, hr3 * y)
        // hexPt(2, 1) = pt(2 + 0.5 * 1, hr3 * 1) = pt(2.5, 0.8660254037844386)
        expect(point.x).toBeCloseTo(2.5);
        expect(point.y).toBeCloseTo(hr3);
      });
    
      test('padd adds two points', () => {
        const p1 = pt(3, 4);
        const p2 = pt(2, -1);
        const result = padd(p1, p2);
        
        expect(result).toEqual({ x: 5, y: 3 });
      });
    
      test('psub subtracts second point from first point', () => {
        const p1 = pt(3, 4);
        const p2 = pt(2, -1);
        const result = psub(p1, p2);
        
        expect(result).toEqual({ x: 1, y: 5 });
      });
    });
    
    describe('Matrix Operations', () => {
      test('inv correctly inverts a transformation matrix', () => {
        const matrix = [2, 0, 3, 0, 2, 4];
        const inverse = inv(matrix);
        
        // For [a, b, c, d, e, f], the inverse should be:
        // [e/(a*e-b*d), -b/(a*e-b*d), (b*f-c*e)/(a*e-b*d), -d/(a*e-b*d), a/(a*e-b*d), (c*d-a*f)/(a*e-b*d)]
        
        expect(inverse[0]).toBeCloseTo(0.5); // e/(a*e-b*d) = 2/(2*2-0*0) = 2/4 = 0.5
        expect(inverse[1]).toBeCloseTo(0);   // -b/(a*e-b*d) = -0/4 = 0
        expect(inverse[2]).toBeCloseTo(-1.5); // (b*f-c*e)/(a*e-b*d) = (0*4-3*2)/4 = -6/4 = -1.5
        expect(inverse[3]).toBeCloseTo(0);   // -d/(a*e-b*d) = -0/4 = 0
        expect(inverse[4]).toBeCloseTo(0.5); // a/(a*e-b*d) = 2/4 = 0.5
        expect(inverse[5]).toBeCloseTo(-1);  // (c*d-a*f)/(a*e-b*d) = (3*0-2*4)/4 = -8/4 = -2
      });
    
      test('mul correctly multiplies two transformation matrices', () => {
        const A = [1, 2, 3, 4, 5, 6];
        const B = [7, 8, 9, 10, 11, 12];
        const result = mul(A, B);
        
        // Expected: [
        //   A[0]*B[0] + A[1]*B[3], A[0]*B[1] + A[1]*B[4], A[0]*B[2] + A[1]*B[5] + A[2],
        //   A[3]*B[0] + A[4]*B[3], A[3]*B[1] + A[4]*B[4], A[3]*B[2] + A[4]*B[5] + A[5]
        // ]
        
        expect(result[0]).toBe(1*7 + 2*10);     // 27
        expect(result[1]).toBe(1*8 + 2*11);     // 30
        expect(result[2]).toBe(1*9 + 2*12 + 3); // 36
        expect(result[3]).toBe(4*7 + 5*10);     // 78
        expect(result[4]).toBe(4*8 + 5*11);     // 87
        expect(result[5]).toBe(4*9 + 5*12 + 6); // 102
      });
    
      test('matrixTo finds transformation matrix between two affine transforms', () => {
        // Simple case: Identity to translation
        const A = [1, 0, 0, 0, 1, 0]; // Identity
        const B = [1, 0, 5, 0, 1, 5]; // Translation (5,5)
        
        const result = matrixTo(A, B);
        
        // The first 6 elements of the result should be close to [1, 0, 5, 0, 1, 5]
        expect(result[0]).toBeCloseTo(1);
        expect(result[1]).toBeCloseTo(0);
        expect(result[2]).toBeCloseTo(5);
        expect(result[3]).toBeCloseTo(0);
        expect(result[4]).toBeCloseTo(1);
        expect(result[5]).toBeCloseTo(5);
      });
    
      test('trot creates a rotation matrix for a given angle', () => {
        // Mock trigonometric functions
        global.cos = jest.fn(angle => Math.cos(angle));
        global.sin = jest.fn(angle => Math.sin(angle));
        
        const angle = Math.PI / 4; // 45 degrees
        const result = trot(angle);
        
        expect(result[0]).toBeCloseTo(Math.cos(angle)); // cos(45°) ≈ 0.7071
        expect(result[1]).toBeCloseTo(-Math.sin(angle)); // -sin(45°) ≈ -0.7071
        expect(result[2]).toBe(0);
        expect(result[3]).toBeCloseTo(Math.sin(angle)); // sin(45°) ≈ 0.7071
        expect(result[4]).toBeCloseTo(Math.cos(angle)); // cos(45°) ≈ 0.7071
        expect(result[5]).toBe(0);
      });
    
      test('getRotation extracts rotation angle from a matrix', () => {
        const angle = Math.PI / 6; // 30 degrees
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        
        const matrix = [c, -s, 0, s, c, 0];
        const extractedAngle = getRotation(matrix);
        
        expect(extractedAngle).toBeCloseTo(angle);
      });
    
      test('ttrans creates a translation matrix', () => {
        const tx = 5;
        const ty = -3;
        const result = ttrans(tx, ty);
        
        expect(result).toEqual([1, 0, 5, 0, 1, -3]);
      });
    
      test('rotAbout creates rotation around a specific point', () => {
        // Mock trigonometric functions
        global.cos = jest.fn(angle => Math.cos(angle));
        global.sin = jest.fn(angle => Math.sin(angle));
        
        const center = pt(2, 3);
        const angle = Math.PI / 2; // 90 degrees
        
        const result = rotAbout(center, angle);
        
        // For rotation around (2,3) by 90 degrees:
        // 1. Translate (-2,-3)
        // 2. Rotate 90 degrees [0, -1, 0, 1, 0, 0]
        // 3. Translate (2,3)
        
        const expected = mul(
          ttrans(2, 3),
          mul(
            [0, -1, 0, 1, 0, 0],
            ttrans(-2, -3)
          )
        );
        
        for (let i = 0; i < 6; i++) {
          expect(result[i]).toBeCloseTo(expected[i]);
        }
      });
    
      test('transPt transforms a point using a matrix', () => {
        const matrix = [2, 0, 1, 0, 2, 3];  // Scale by 2 and translate (1,3)
        const point = pt(3, 4);
        
        const result = transPt(matrix, point);
        
        // Expected: (2*3 + 0*4 + 1, 0*3 + 2*4 + 3) = (7, 11)
        expect(result).toEqual({ x: 7, y: 11 });
      });
    });
    
    describe('Line and Segment Operations', () => {
      test('matchSeg creates a matrix to map unit interval to a line segment', () => {
        const p = pt(1, 2);
        const q = pt(4, 6);
        
        const result = matchSeg(p, q);
        
        // Expected: [q.x - p.x, p.y - q.y, p.x, q.y - p.y, q.x - p.x, p.y]
        // = [4-1, 2-6, 1, 6-2, 4-1, 2] = [3, -4, 1, 4, 3, 2]
        expect(result).toEqual([3, -4, 1, 4, 3, 2]);
      });
    
      test('matchTwo creates a matrix to match one line segment to another', () => {
        const p1 = pt(1, 1);
        const q1 = pt(3, 3);
        const p2 = pt(0, 0);
        const q2 = pt(1, 1);
        
        const result = matchTwo(p1, q1, p2, q2);
        
        // This should create a matrix that scales by 0.5 (since second segment is half the size)
        expect(result[0]).toBeCloseTo(0.5);  // Scale x by 0.5
        expect(result[4]).toBeCloseTo(0.5);  // Scale y by 0.5
        expect(result[2]).toBeCloseTo(-0.5); // Adjust x translation
        expect(result[5]).toBeCloseTo(-0.5); // Adjust y translation
      });
    
      test('intersect finds intersection of two line segments', () => {
        const p1 = pt(0, 0);
        const q1 = pt(4, 4); // Line from (0,0) to (4,4)
        const p2 = pt(0, 4);
        const q2 = pt(4, 0); // Line from (0,4) to (4,0)
        
        const result = intersect(p1, q1, p2, q2);
        
        // These lines intersect at (2,2)
        expect(result.x).toBeCloseTo(2);
        expect(result.y).toBeCloseTo(2);
      });
    });


    