/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
import * as BABYLON from 'babylonjs';

export class Food{
    private food: Array<{vector: BABYLON.Vector3, color: BABYLON.Color3}> = [];
    
    private world : {width: number ,height: number};
    
    constructor(world  : {width: number ,height: number}){
        this.world = world;
    }
    createFood() {
        while (this.food.length < 2500) {
            var color = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
            var position = new BABYLON.Vector3();

            var maxWidth = this.world.width * 2;
            var maxHeight = this.world.height * 2;

            var posX = (Math.random() * maxWidth)  - (maxWidth / 2);
            var posY = (Math.random() * maxHeight) - (maxHeight / 2);
            var point = {
                vector: new BABYLON.Vector3(posX, posY, 0),
                color: new BABYLON.Color3(Math.random(), Math.random(), Math.random())
            };
            this.food.push(point);
        }
    }
    
    drawFood(){
        
        
        
    }
    
}