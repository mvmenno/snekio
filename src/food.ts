/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
import * as BABYLON from 'babylonjs';
import {Geometry} from './geometry';
import {Helper} from './helper';

export class Food{
    
    private food:Array<Array<{vector: BABYLON.Vector3, color: BABYLON.Color3}>> = [];
    private geometry: Geometry;
    private world : {width: number ,height: number};
    private foodIdx: number = 1000;
    
    private maxFood : number = 5000;
    private currentFood : number = 0;
    
    private foodColor: BABYLON.Color3;
    
    private helper : Helper;
    
    constructor(world  : {width: number ,height: number},geometry:Geometry){
        this.world = world;
	this.geometry = geometry;
	
        this.helper = new Helper();
	this.foodColor = new BABYLON.Color3(0,1,0);
    }
    getFood(){
	return this.food;
    }
    eatFood(chunkCoord:number,index:number){
        if(this.food[chunkCoord]){
            this.food[chunkCoord].splice(index,1);
        }
    }
    createFood() {
        var maxI = 2;
        var ic = 0;
        
        //&& ic < maxI
        while (this.currentFood < this.maxFood && ic < maxI ) {
            var maxWidth = this.world.width * 2;
            var maxHeight = this.world.height * 2;
	    
            var posX = (Math.random() * maxWidth)  - (maxWidth / 2);
            var posY = (Math.random() * maxHeight) - (maxHeight / 2);
	    
            var vector = new BABYLON.Vector3(posX,posY,0);
            
	    var chunkCoord =  this.helper.getChunkFromCoord(vector,this.world);
            
            var point = {
                vector: vector,
                color: this.foodColor 
            };
            if(!this.food[chunkCoord]){
                this.food[chunkCoord] = [];   
            }
            
            this.food[chunkCoord].push(point);
            this.currentFood ++;
            ic ++;
        }
    }
    drawFood(){
        if(this.food){
            for (var i = 0; i < this.food.length; i++) {
                if(this.food[i]){
                    for (var j = 0; j < this.food[i].length; j++) {
                        var point = this.food[i][j];
                        this.geometry.drawCircle(point.vector, 0.025, point.color,(this.foodIdx + i + j));
                    }
                }
            }
        }
    }
    
}