/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
import * as BABYLON from 'babylonjs';
import {Helper} from './helper';
import {Snake} from './snake';

export class Food{
    
    private food:Array<Array<{vector: BABYLON.Vector3}>> = [];
    private world : {width: number ,height: number};
    private foodIdx: number = 10000;
    
    private maxFood : number = 500;
    private currentFood : number = 0;
    private helper : Helper;
    
    constructor(world  : {width: number ,height: number}){
        this.world = world;	
        this.helper = new Helper();
    }
    getFood(){
	return this.food;
    }
    eatFood(chunkCoord:number,index:number){
        if(this.food[chunkCoord]){
            this.food[chunkCoord].splice(index,1);
            this.currentFood -= 1;
        }
    }
    createFood() {
        var maxI = 2;
        var ic = 0;
        
        //&& ic < maxI
        while (this.currentFood < this.maxFood && ic < maxI ) {
            var maxWidth = this.world.width;
            var maxHeight = this.world.height;
	    
            var posX = (Math.random() * (maxWidth + maxWidth))  - maxWidth;
            var posY = (Math.random() * (maxHeight + maxHeight)) - maxHeight;
            
            var vector = new BABYLON.Vector3(posX,posY,0);
            
	    var chunkCoord =  this.helper.getChunkFromCoord(vector,this.world);
            
            var point = {
                vector: vector,
            };
            if(!this.food[chunkCoord]){
                this.food[chunkCoord] = [];   
            }
            this.food[chunkCoord].push(point);
            this.currentFood ++;
            ic ++;
        }
    }
}