//code for building a bottom up ring based approach, should be the final dep on the html due to little relying o nit apart from draw

class RingBuilder{
    constructor(n_rings){
        this.n_rings = n_rings;
        this.tiles = new TileArray();
    }


    buildNRings(init_tile){
        //build the array of Nrings
        let inner_tiles = []; //contains the inner tiles in the array that are always considered valid
        let outer_tiles = [init_tile]; //contains the outer tiles in the array that are valid, yet should be added to
        let new_outer_tiles = []; //array of the new tiles being added to the current outer tiles.
        this.tiles.add(init_tile);
        console.log("added init tile to outer_tiles sorted arr");
        for (let i;i<this.n_rings;i++){
            while (outer_tiles.some(tile => tile.edges.includes(0))){
            let outer_tile = this.getRandomOpenTile(outer_tiles); // choose one of the tiles on the edge that has an open edge.
            let trans = this.chooseValidTransformTo(outer_tile); // find valid transform given a tiles currently open edges


            if (trans){
                //means there is still a valid transform to add to the hat.
            
                let tempTrans = mul(outer_tile.trans,trans); //create an instance for the "ghost" tile to check for overlaps.


                //check the surrounding hats to see if any of them overlap, if none overlap then we should place it down.
                if (this.checkIfPlacementValid(tempTrans)){
                    //tile is valid, add it to the surrounding tiles.
                    let tempCentre = findCentreOfShape(hat_outline,placement);
                    let new_tile = new Tile(tempCentre,tempTrans,true);
                    this.tiles.add(new_tile);
                    console.log("adding tile" + new_tile);
                    //
                    new_outer_tiles.push(new_tile); //used for the rings
                    //make new tile, then add it to the array
            
                    this.updateSurroundingTileEdges();
                }
            } else {
                //means there is no valid tile that can be added to this outer tile, i.e we need to back track.

                //backtrack by removing ALL hats connected to this outer_tile
                //as well as all hats that are connnected to outer_tiles neighbour on the 2nd outer ring 

                this.handleBacktrack(outer_tile);

            }
        }
            outer_tiles=new_outer_tiles;
            new_outer_tiles=[];
        }
        

    }

    handleBacktrack(tile){
        
        this.removeNeighboursFrom(tile);

        let inner_neighbours = this.findInnerNeighbours(tile);
        for (let inner_neighbour of inner_neighbours){
            this.removeNeighboursFrom(inner_neighbour);
        }
    }

    findInnerNeighbours(tile){
        let out = [];
        for (let neighbour of outer_tiles){
            if (this.checkIfConnected(tile,neighbour)){
                out.push(neighbour);
            }
        }
        return out;
    }
    findOuterNeighbours(tile){
        let out = [];
        for (let neighbour of new_outer_tiles){
            if (this.checkIfConnected(tile,neighbour)){
                out.push(neighbour);
            }
        }
        return out;
    }

    removeNeighboursFrom(tile){
        let tiles_to_remove = this.findOuterNeighbours(tile);

        for (let tile of tiles_to_remove){
            this.removeTile(tile);
        }
    }

    removeTile(tile){
        //remove tile from new_outer_tiles

        //convert all surrounding edge values to 0 to account for them now being opened
        this.updateSurroundingTileEdges(tile,true);
        
        //remove from new_outer array
        new_outer_tiles = new_outer_tiles.filter(tile => tile !== specificTile);

    }


    chooseValidTransformTo(tile){
        let edge_array = tile.edges;
        //only need first col
        const transform_edges = transformation_edge_fills.map(pair => pair[0]);
    
        //randomises to prevent overuse of specific translation while keeping the index known
        const indexedTransforms = transform_edges.map((edges, index) => ({
          edges,
          originalIndex: index
      }));
        //randomise the struct
        for (let i = indexedTransforms.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indexedTransforms[i], indexedTransforms[j]] = 
          [indexedTransforms[j], indexedTransforms[i]];
      }
          //finds a valid transform, i.e one that only acts on edges that are open.
          const validTransform = indexedTransforms.find(
            transform => transform.edges.every(edge => edge_array[edge] === 0)
        );
    
        // Return index of found valid transform in the original array, if not return null
        return validTransform ? validTransform.originalIndex : null;
    
    }
    getRandomOpenTile(arr) {
        return arr[Math.floor(Math.random() * arr.filter(t => t.edges.includes(0)).length)];
    }

    updateSurroundingTileEdges(new_tile,remove_bool=false){
        //adding new tile to local area
        let local_tiles = this.tiles.rangeSearch(tempCentre.x-70,tempCentre.x+70,tempCentre.y-70,tempCentre.y+70);
        //find the transformation of the differences between each tiles
    
        for (let local_tile of local_tiles){
          //check how we go from the tile to all of its neighbours, 
          if (remove_bool){
            this.removeEdgeValues(local_tile,new_tile);
          }else {
            this.addEdgeValues(local_tile,new_tile);
          }
        }
    }

    checkIfConnected(tile1,tile2){
        //this checks if tile1 and tile2 are connected along an edge or more,
        //i.e it checks the struct for all valid inter hat matrices, figures out which one conncets t1 -> t2, 
        //if it does connect return idx, if it doesnt return -1
        let trans = matrixTo(tile1.trans,tile2.trans);
        return local_hat_transforms.findIndex(vec => 
            vec.every((val, i) => Math.abs(val - trans[i]) < EPSILON)
        );

    }

    addEdgeValues(tile1,tile2){
        //get idx of the transformation in the set of all transformation.
        const EPSILON = 1e-2;
        let idx = this.checkIfConnected(tile1,tile2);

        if (idx != -1){
            //this means they are connected by a valid transformation, so update the edge values accordingly.
            let tile1_update_indexes = transformation_edge_fills[idx][0]
            let tile2_update_indexes = transformation_edge_fills[idx][1]
            
            for (let edge_idx of tile1_update_indexes) {
                tile1.edges[edge_idx] = 1;  
            }
            
            for (let edge_idx of tile2_update_indexes) {
                tile2.edges[edge_idx] = 1;  
            }
            return true;
        }
        return false;
    }

    removeEdgeValues(tile1,tile2,trans){
        //get idx of the transformation in the set of all transformation.
        const EPSILON = 1e-2;
        let idx = local_hat_transforms.findIndex(vec => 
            vec.every((val, i) => Math.abs(val - trans[i]) < EPSILON)
        );

        if (idx != -1){
            //this means they are connected by a valid transformation, so update the edge values accordingly.
            let tile1_update_indexes = transformation_edge_fills[idx][0]
            let tile2_update_indexes = transformation_edge_fills[idx][1]
            
            for (let edge_idx of tile1_update_indexes) {
                tile1.edges[edge_idx] = 0;  
            }
            
            for (let edge_idx of tile2_update_indexes) {
                tile2.edges[edge_idx] = 0;  
            }
            return true;
        }
        return false;
    }

    checkIfPlacementValid(placement){
        //checks for overlaps in the local area.
        //do range search to get local tiles.
        //check each local tile against this transformation to see if there is overlap
        let tempCentre = findCentreOfShape(hat_outline,placement);
        let local_tiles = this.rangeSearch(tempCentre.x-70,tempCentre.x+70,tempCentre.y-70,tempCentre.y+70,outer_tiles);
        for (let tile of local_tiles){
          if (this.checkForOverlap(this.convertTransToEdges(tile.trans,placement))){
            return false;
          }
        }
        return true; //no overlap on any local tiles
    }

    convertTransToEdges(trans1, trans2) {
        const points1 = [];
        for (let p of hat_outline) {
            const tp1 = transPt(trans1, p);
            points1.push(tp1);
        }
        
        const points2 = [];
        for (let p of hat_outline) {
            const tp2 = transPt(trans2, p);
            points2.push(tp2);
        }
        
        const edges1 = [];
        for (let i = 0; i < points1.length; i++) {
            const start = points1[i];
            const end = points1[(i + 1) % points1.length];  
            edges1.push([start, end]);
        }
        
        const edges2 = [];
        for (let i = 0; i < points2.length; i++) {
            const start = points2[i];
            const end = points2[(i + 1) % points2.length];  // % for wrapping back to start
            edges2.push([start, end]);
        }
        
        return [edges1, edges2];
    }

    doPolygonsOverlap(edges1, edges2) {
        // Check each pair of edges
        for (let i = 0; i < edges1.length; i++) {
            for (let j = 0; j < edges2.length; j++) {
                const intersectionType = doEdgesIntersect(edges1[i], edges2[j]);
                // If edges properly intersect (not just sharing endpoints or coincident)
                if (intersectionType === 'intersect') {
                    return true;
                }
            }
        }
        
        // If no proper intersections, check if one polygon is inside the other
        const pointFromPoly1 = edges1[0][0];
        const pointFromPoly2 = edges2[0][0];
        
        if (isPointInPolygon(pointFromPoly1, edges2) || 
            isPointInPolygon(pointFromPoly2, edges1)) {
            return true;
        }
        
        return false;
    }
    
    doEdgesIntersect(edge1, edge2) {
        const [[x1, y1], [x2, y2]] = edge1;
        const [[x3, y3], [x4, y4]] = edge2;
        
        // Check if edges share endpoints
        if ((x1 === x3 && y1 === y3) || 
            (x1 === x4 && y1 === y4) || 
            (x2 === x3 && y2 === y3) || 
            (x2 === x4 && y2 === y4)) {
            return 'share_endpoint';
        }
        
        // Calculate denominator for intersection check
        const denominator = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
        
        // If denominator is 0, lines are parallel
        if (denominator === 0) {
            // Check if edges are collinear
            const crossProduct = (y3 - y1) * (x2 - x1) - (x3 - x1) * (y2 - y1);
            if (Math.abs(crossProduct) < 1e-10) {  // Using epsilon for floating point comparison
                // Check if edges overlap
                const overlap = !(Math.max(x1, x2) < Math.min(x3, x4) || 
                                Math.min(x1, x2) > Math.max(x3, x4) ||
                                Math.max(y1, y2) < Math.min(y3, y4) ||
                                Math.min(y1, y2) > Math.max(y3, y4));
                return overlap ? 'coincident' : 'none';
            }
            return 'none';
        }
        
        const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denominator;
        const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denominator;
        
        // Check if intersection point lies within both line segments
        if (ua > 0 && ua < 1 && ub > 0 && ub < 1) {
            return 'intersect';
        }
        
        return 'none';
    }
    
    isPointInPolygon(point, edges) {
        const [x, y] = point;
        let inside = false;
        
        for (const edge of edges) {
            const [p1, p2] = edge;
            const [x1, y1] = p1;
            const [x2, y2] = p2;
            
            if (((y1 > y) !== (y2 > y)) && 
                (x < (x2 - x1) * (y - y1) / (y2 - y1) + x1)) {
                inside = !inside;
            }
        }
        
        return inside;
    }
}