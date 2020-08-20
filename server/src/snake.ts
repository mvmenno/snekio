/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import * as BABYLON from 'babylonjs';

export class Snake{
    
    private initSnakeLength : number = 10;
    protected snakeArr : [Array<BABYLON.Vector3>] = [[]];
    protected playerVelocities : [{}] = [{}];
    protected t = Date.now();
    protected initRadius : number;
    constructor(initRadius : number){
        this.initRadius = initRadius;
    }
    
    
    createSnake(player,sessionId){
        var addLength = 0.0001;
        var currentLength = 0;
        this.snakeArr[sessionId] = [];
                var maxWidth = 6 - 0.1;
                var maxHeight = 6 - 0.1;

                var posX = (Math.random() * (maxWidth + maxWidth))  - maxWidth;
                var posY = (Math.random() * (maxHeight + maxHeight)) - maxHeight;
        
        for (var i = 0; i < this.initSnakeLength; i++){
           var newVector = new BABYLON.Vector3(posX,posY + currentLength ,0);
           this.snakeArr[sessionId].push(newVector);
           currentLength += addLength;
        }
    }
    getPlayerSnake(sessionId) : Array<BABYLON.Vector3>{
        if (this.snakeArr[sessionId]){
            return this.snakeArr[sessionId];
        }else{
            return [];
        }
    }
    addLengthPlayerSnake(sessionId,radius : number,length : number){
        if(this.snakeArr[sessionId]){
            for(var i =0; i < length; i++){
                var lastSegment = this.snakeArr[sessionId][this.snakeArr.length - 1];
                
                var newVector = new BABYLON.Vector3(lastSegment.x,lastSegment.y,0);
                this.snakeArr[sessionId].push(newVector);
            }
        }
        
        var s = 0.0002;
        // var s = 0.02;
        
        var r = this.initRadius + ( (this.snakeArr[sessionId].length - this.initSnakeLength) * s);  
        return r;
    }
    setPlayerVelocity(vx:number,vy:number,sessionId){
        var velocity = {vx:vx,vy:vy};
        this.playerVelocities[sessionId] = velocity;
    }
    getPlayerVelocity(sessionId){
        if(this.playerVelocities[sessionId]){
            return this.playerVelocities[sessionId];
        }else{
            return {vx:0,vy:0};
        }
    }
    updateSnakePlayers(players){
        var d = 0.01;
        var angularDrag = 0.005;
        var t = Date.now();
        var dt = t - this.t;
        
        for(var key in players){
            if(players.hasOwnProperty(key)){
                
              //  this.addLengthPlayerSnake(key,1);
                var player = players[key];
                var sessionId = key;
                if (!this.snakeArr[sessionId]){
                    this.createSnake(player,sessionId);
                }else{

                    var playerSnake = this.snakeArr[sessionId];

                    for (var i = playerSnake.length - 1; i >=1; i--){
                        this.snakeArr[sessionId][i].x = (this.snakeArr[sessionId][i - 1].x ) - d * (Math.cos(player.angle + (player.angle * angularDrag)));
                        this.snakeArr[sessionId][i].y = (this.snakeArr[sessionId][i - 1].y ) - d * (Math.sin(player.angle  + (player.angle * angularDrag)));
                    }

                  //  var force = 0.0005 * dt;
                    
                    /*var sf = 1 - (playerSnake.length / 10) + 10 ;
                    if(sf > 1){
                        sf = 1;
                    }*/
                    
                    
                    
                    var f = 0.0005;
                    
                    var sf = 1;
                   
                    //keep decreasing if length > 10 
                    
                  //  var sf = playerSnake.length / 1.1;
                    
                    var s = 0.0002;
                   // var s = 0.02;
                    var sf = 1 - ( (playerSnake.length - this.initSnakeLength) * s);  
                    
                    
                    if(sf > 1){
                        sf = 1;
                    }
                    var force = (f * sf   ) * dt;
                    var vx = force * Math.cos(player.angle);
                    var vy = force * Math.sin(player.angle);
                    
                    this.setPlayerVelocity(vx,vy,key);
                    

                    this.snakeArr[sessionId][0].x += vx;
                    this.snakeArr[sessionId][0].y += vy;
                   // return {'vx':vx,'vy':vy};
                }
            }
        }
        this.t = t;
    }
}