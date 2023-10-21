/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
import {Helper} from './helper';
import * as BABYLON from 'babylonjs';
import {Food} from './food';

export class Collision{

    private helper;
    private world;
    constructor(world){
        this.helper = new Helper();
        this.world = world;
    }


    collisionFood(player: any,food : Food){
        var atePoints = 0;
        if(player.snake[0]){

            var snakePos = new BABYLON.Vector3(player.snake[0].x,player.snake[0].y,0);
            var x1 = player.snake[0].x;
            var y1 = player.snake[0].y;

            var points = food.getFood();
            var chunkCoord =  this.helper.getChunkFromCoord(snakePos,this.world);
            var surroundingChunks = this.helper.getIncludingSurroundingChunks(chunkCoord);

            var ld = 99999999; 
         //   for (var i = 0; i < surroundingChunks.length; i++){
                var currentChunk = chunkCoord;
                if (points[currentChunk]){
                    for (var j = 0; j < points[currentChunk].length; j++) {
                        var point = points[currentChunk][j];
                        if(point){
                            var distance = Math.sqrt(Math.pow(x1 - point.vector.x, 2) + Math.pow(y1 - point.vector.y, 2));

                            if(distance < ld){
                                ld = distance;
                            }
                            if (distance < 0.15) {
                                food.eatFood(currentChunk,j);
                                atePoints++;
                                //return true;
                            }
                        }
                    }
                    return atePoints;
                }
            }
       // }
        return atePoints;
    }
    collisionOOB(player){
        
        if(player){
            var p1 = player.snake[0];
             //   if(this.snake[0].x > this.world.width || this.snake[0].x < -this.world.width){
            if(p1){
               // console.log(p1);
                if(p1.x > this.world.width || p1.x < -this.world.width){
                    return true;
                }
                if(p1.y > this.world.height || p1.y < -this.world.height){
                    return true;
                }
            }
            return false;
        }
    }
    collisionPlayer(player,players){
        
        var p1 = player.snake[0];
        if(p1){
            for(var key in players){
                if(players.hasOwnProperty(key)){
                    if(players[key].uuid != player.uuid){
                        //dont check self collision for now

                        for(var j = 0; j < players[key].snake.length; j++){

                            var p2 = players[key].snake[j];

                            var d = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
                            if (d < 0.025) {
                                console.log('PLAYER DIED!'+player.uuid);
                                
                                return key;
                            }
                        }
                    }
                }        
            }
        }
        return;
    }


}