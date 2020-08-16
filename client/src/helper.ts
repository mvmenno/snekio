import * as BABYLON from 'babylonjs';

export class Helper{
    
    private gridSize : number = 16;
    scale(num:number, in_min:number, in_max:number, out_min:number, out_max:number){
        return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
    getChunkFromCoord(coord: BABYLON.Vector3,world:{width: number ,height: number}){
        var x = Math.round(this.scale(coord.x, -world.width, world.width, 0, this.gridSize));
        var y = Math.round(this.scale(coord.y, -world.height, world.height, 0, this.gridSize));
        
        var c = x ;
        
        if(y > 0){
            c = x * y;
        }
        
        return c;
    }
    getIncludingSurroundingChunks(chunk:number){
        var chunks = [];
        
        var gridSize = this.gridSize;
        var totalGridsize = gridSize * gridSize;
        
        chunks.push(chunk);
        if (chunk + 1 <= totalGridsize){
            chunks.push(chunk + 1);
        }
        if (chunk - 1 >= 0){
            chunks.push(chunk - 1);
        }
        if (chunk - gridSize >= 0){
            chunks.push(chunk - gridSize);
        }
        if ((chunk + gridSize) <= totalGridsize){
            chunks.push(chunk + gridSize);
        }
        if((chunk - 1 - gridSize) >= 0){
            chunks.push(chunk - 1 - gridSize);
        }
        if((chunk - 1 + gridSize) <= totalGridsize){
            chunks.push(chunk - 1 + gridSize);
        }
        if((chunk + 1 - gridSize) >= 0){
            chunks.push(chunk + 1 - gridSize);
        }
        if((chunk + 1 + gridSize) <= totalGridsize){
            chunks.push(chunk + 1 + gridSize);
        }
        
        return chunks;
    }
}