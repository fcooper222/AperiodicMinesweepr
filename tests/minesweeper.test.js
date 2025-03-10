const { Tile, TileArray } = require('../src/tiles.js');
const { decideColour } = require('../src/hat.js');
const { transPt } = require('../src/geometry.js');


beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  

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