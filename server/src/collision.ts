/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
import {Food} from './food';
import {Helper} from './helper';

export class Collision{

    private food;
    private helper;
    private world;
    constructor(world){
        this.food = new Food(world);
        this.helper = new Helper();
        this.world = world;
    }


    collisionFood(player: any){
        console.log('collision food check!');
        console.log(player);
        
        var snakePos = {x:player.x,y:player.y};

        var x1 = player.x;
        var y1 = player.y;

        var points = this.food.getFood();
        var chunkCoord =  this.helper.getChunkFromCoord(snakePos,this.world);
        var surroundingChunks = this.helper.getIncludingSurroundingChunks(chunkCoord);
        console.log(surroundingChunks);
        
        throw new Error('dbg');
        for (var i = 0; i < surroundingChunks.length; i++){
            var currentChunk = surroundingChunks[i];
            if (points[currentChunk]){
                for (var j = 0; j < points[currentChunk].length; j++) {
                    var point = points[currentChunk][j];

                    if(point){
                        var distance = Math.sqrt(Math.pow(x1 - point.vector.x, 2) + Math.pow(y1 - point.vector.y, 2));
                        
                        console.log(distance);
                        if (distance < 0.075) {
                            
                            console.log('eat it!');
                            this.food.eatFood(currentChunk,j);
                        }
                    }
                }
            }
        }

    }



}