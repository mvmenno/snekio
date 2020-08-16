/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
import * as BABYLON from 'babylonjs';
import {Geometry} from './geometry';
import {Helper} from './helper';

export class Food{
    
    private food:Array<Array<{vector: BABYLON.Vector3}>> = [];
    private geometry: Geometry;
    private world : {width: number ,height: number};
    private foodIdx: number = 1000;
    
    private maxFood : number = 100;
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
    updateFood(foodData :Array<Array<{vector: BABYLON.Vector3}>>){
        
        var c = this.foodIdx;
        /*for(var i = 0; i < this.food.length;i++){
            for(var j = 0; j < foodData.length; j ++){
                if(!foodData[i]){
                    this.geometry.clearIndex(c);
                }
            }
            c++;
        }*/
        
        
        
        //this.geometry.clearAll();
        if(foodData){
            this.food = foodData;
        }
    }
    
    drawFood(){
        if(this.food){
            for (var i = 0; i < this.food.length; i++) {
                if(this.food[i]){
                    for (var j = 0; j < this.food[i].length; j++) {
                        if(this.food[i][j]){
                            var point = this.food[i][j];
                            this.geometry.drawCircle(point.vector, 0.025, this.foodColor,(this.foodIdx + i + j));               
                        }
                    }
                }
            }
        }
    }
    
}