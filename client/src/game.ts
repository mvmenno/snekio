import * as BABYLON from 'babylonjs';
import {Scene} from './scene';
import {Line2D} from './line2d';
import {Geometry} from './geometry';
import {Material} from './material';
import {Food} from './food';
import {Gui} from './gui';
import {Shader} from './shader';
import {Helper} from './helper';
import * as io from "socket.io-client";

class Game {
    
    private canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    private engine: BABYLON.Engine;
    private scene: Scene;
    private snake: Array<BABYLON.Vector3> = [];
    
    private players: Array<{
        score : number
        nickName : string,
        snake : any,
        x : number,
        y : number,
        angle : number
        uuid : string,
        color : BABYLON.Color3,
        velocity : {vx:number,vy:number}
    }> = [];
    
    private playerFrames : any = [];
    private playerFrameTime: number = 100;
    private playerFrameDT: number = 0;
    private playerFrameDTSub: number = 0;
    
    private points: Array<{vector: BABYLON.Vector3, color: BABYLON.Color3}> = [];
    private snakeColor: Array<BABYLON.Color3> = [];
    private postProcess: BABYLON.PostProcess;
    private fadeLevel:number = 1.0;

    private velocity: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);

    private mouse: {x: number, y: number} = {x: 0, y: 0};

    private snakeMat: BABYLON.StandardMaterial;
    private camera: BABYLON.ArcRotateCamera;
    
    private world : {width: number ,height: number};
    private pauzed : boolean = false;
    
    private currentAngle : number = 0;
    private deathAnimimationFrame : number = 0;;
    private isDeath : boolean = false;
    private frameCnt : number = 0;
    private meshCount : number = 0;
    
    private showMainMenu : boolean = true;
    private toggledMainMenu : boolean = true;
    
    /*
     * Define class types
     */
    private geometry: Geometry;
    private material: Material;
    private food: Food;
    private gui: Gui;
    private shader: Shader;
    private helper : Helper;
    private socket : SocketIOClient.Socket;
    private nickName : string = 'Player';
    
    private leaderBoard : [{nickName :string,score:number}];
    private uuid : string = this.uuidv4();
    
    
    constructor() {
        
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
        
        
        this.scene.onPointerObservable.add((pointerInfo) => {
            this.mouse = pointerInfo.pickInfo.ray.direction;
        });
        this.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type){
                case BABYLON.KeyboardEventTypes.KEYUP:
                    if(kbInfo.event.key == 'p'){
                        this.togglePauze();
                    }
                break;
            }
            
        });
        this.world = {
            width : 6,
            height : 6
        };
	
	
	// Init other classes
	this.material = new Material(this.scene);
        this.geometry = new Geometry(this.scene,this.material);
	this.food = new Food(this.world,this.geometry);
        
        this.gui = new Gui();
        
	this.shader = new Shader();
        this.helper = new Helper();
        
        var scene = this.scene;
        this.createBoundingBox();
        
        
        var self = this;
        
        this.init();
        this.engine.runRenderLoop(function () {
            self.update();
            scene.render();
        });
    }
    
    init(){
        this.snake = [];
        this.points = [];
        this.fadeLevel = 1;
        this.velocity = new BABYLON.Vector3(0, 0, 0);
        this.pauzed = false;
        this.currentAngle = 0;
        this.deathAnimimationFrame = 0;
        this.isDeath = false;
        this.frameCnt = 0;
        this.meshCount ++;
        
        this.scene.camera.position = new BABYLON.Vector3(0, 0, 5);
        
        this.socket = io('http://home.mennovanmuilwijk.nl:5000');

        this.initServerListeners();
        this.checkGUIState();
        
        var self = this;
        window.addEventListener('resize',function(){
            self.engine.resize();
        });
    }
    
    
    
    
    
    
    initServerListeners(){
        var self = this;
        this.socket.on('update-food',function(foodData:Array<Array<{vector: BABYLON.Vector3, color: BABYLON.Color3}>>){
            self.food.updateFood(foodData);
        });
        this.socket.on('update-players-score',function(scores: [{nickName :string,score:number}]){
            for(var  i =0; i < scores.length;i++){
                if (scores[i].nickName == self.nickName){
                    self.gui.setScore(scores[i].score);
                    break;
                }
            }
            
            self.gui.updateGUIHighScores(scores);
        });
        
        this.socket.on('update-players',function(players : any){
            var dt = Date.now() - self.playerFrameTime;
            
            if(players.length > 0){
                
                for(var i = 0 ; i < players.length; i++){
                    if(players[i]){
                        if(players[i].uuid == self.uuid){
                            var snake = players[i].snake;
                            if(snake){
                                for(var j = 0; j < snake.length; j++){
                                   // self.snake[j] = new BABYLON.Vector3(snake[j].x,snake[j].y,0);
                                }
                                //self.snake = players[i].snake;
                            }
                            /*if(players[i].color){
                                players[i].color = new BABYLON.Color3(players[i].color.r,players[i].color.g,players[i].color.b);
                            }*/
                            if(players[i].velocity){
                                self.velocity = new BABYLON.Vector3(players[i].velocity.vx / 10,players[i].velocity.vy / 10,0);
                            }
                        }
                        var uuid = players[i].uuid;
                        if(players[i].snake[0]){
                               if(!self.playerFrames[uuid]){
                                   self.playerFrames[uuid] = [];
                               }
                               self.playerFrames[uuid].push(players[i].snake);
                               if(self.playerFrames[uuid].length > 2){
                                   self.playerFrames[uuid].splice(0,1);
                               }
                        }
                    }
                }
                self.players = players;
                self.playerFrameTime = Date.now();
                self.playerFrameDT = dt;
                self.playerFrameDTSub = dt;
            }
        });
        
        this.socket.on('dead-player',function(player:any){
            
            //self.geometry.clearAll();
            if(player.uuid == self.uuid){
                console.log('self death!');
                self.geometry.clearAll();
                self.pauzed = true;
                self.triggerDeath();
                window.location.reload();
            }
        });
        
        this.socket.on('connect_failed',function(){
            console.log('connect failed');
            
            document.write('Unable to connect to server! Please try again later');
            
            throw new Error('Unable to connect to server!');
        });
        
        this.socket.on('connect_error',function(){
            document.write('Unable to connect to server! Please try again later');
            
            throw new Error('Unable to connect to server!');
            
            console.log('connect error');
        });
        
        
    }
    
    
    
    
    
    togglePauze(){
        if(!this.pauzed){
            this.pauzed = true;
        }else{
            this.pauzed = false;
        }
        
        
    }
    
    drawCircle(position: BABYLON.Vector3, radius: number, color: BABYLON.Color3 = new BABYLON.Color3(1, 1, 1),index  : number) {
        return this.geometry.drawCircle(position,radius,color,index);
    }

    lerpColor(h1:number,h2:number,steps:number){
        var d = h2 - h1;
        var delta = (d + ((Math.abs(d) > 180) ? ((d < 0) ? 360 : -360) : 0)) / (steps + 1.0);
    //    var turns = [];
        
        /*
        for (var i = 1; d && i <= steps; ++i)
        turns.push(((h1 + (delta * i)) + 360) % 360);
        */
        var c = ((h1 + (delta)) + 360) % 360;
        
        return c;
    }
    lerpPosition(position1:BABYLON.Vector3,position2:BABYLON.Vector3,fraction : number){
        var lx = (position2.x - position1.x) * fraction + position1.x;
        var ly = (position2.y - position1.y) * fraction + position1.y; 
        return new BABYLON.Vector3(lx,ly,0);
    }


    createSnakeColor(){
        var color:BABYLON.Color3;
        if(this.snakeColor.length == 0){
            color = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        }else{
            
            var colorp = this.snakeColor[this.snakeColor.length -1].toHSV();
            var colorr = new BABYLON.Color3(Math.random(), Math.random(), Math.random()).toHSV();
         
            var r = this.lerpColor(colorp.r,colorr.r,25);
            var g = this.lerpColor(colorp.g,colorr.g,25);
            var b = this.lerpColor(colorp.b,colorr.b,25);
            
            var colorRef = new BABYLON.Color3(0,0,0);
            BABYLON.Color3.HSVtoRGBToRef(r,g,b,colorRef);
            
            color = colorRef;
            
        }
        
        this.snakeColor.push(color);
    }


    checkCollision() {
        if(this.snake[0] && this.frameCnt > 50){
            var snakePos = this.snake[0];

            var x1 = snakePos.x;
            var y1 = snakePos.y;
	    
	    var points = this.food.getFood();
            var chunkCoord =  this.helper.getChunkFromCoord(snakePos,this.world);
            
            
            
            var surroundingChunks = this.helper.getIncludingSurroundingChunks(chunkCoord);
            
            for (var i = 0; i < surroundingChunks.length; i++){
                var currentChunk = surroundingChunks[i];
                if (points[currentChunk]){
                    for (var j = 0; j < points[currentChunk].length; j++) {
                        var point = points[currentChunk][j];
                        
                        if(point){
                            var distance = Math.sqrt(Math.pow(x1 - point.vector.x, 2) + Math.pow(y1 - point.vector.y, 2));
                            if (distance < 0.0075) {
                               // console.log('snakePos {x:'+x1+' y:'+y1+'} pointPos {x:'+point.vector.x+' y:'+point.vector.y+'} ');
                                this.food.eatFood(currentChunk,j);
                                this.createSnakeColor();
                                this.snake.push(new BABYLON.Vector3(0, this.snake.length * 0.0001, 0));
                            }
                        }
                    }
                }
            }
            
            
            /*
            if(points[chunkCoord]){
                for (var i = 0; i < points[chunkCoord].length; i++) {
                    var point = points[chunkCoord][i];

                    var distance = Math.sqrt(Math.pow(x1 - point.vector.x, 2) + Math.pow(y1 - point.vector.y, 2));
                    if (distance < 0.075) {
                        this.food.eatFood(chunkCoord,i);
                        this.snakeColor.push(new BABYLON.Color3(Math.random(), Math.random(), Math.random()));
                        this.snake.push(new BABYLON.Vector3(0, this.snake.length * 0.0001, 0));
                    }
                }
            }
            */

            for(var i = this.snake.length -1; i >= 4; i --){
                var point2 = this.snake[i];
                var distance = Math.sqrt(Math.pow(x1 - point2.x, 2) + Math.pow(y1 - point2.y, 2));


                if (distance < 0.025) {
                    this.triggerDeath();

                    break;
                }
            }

            if(this.snake[0].x > this.world.width || this.snake[0].x < -this.world.width){
              //  this.triggerDeath();
            }
            if(this.snake[0].y > this.world.height || this.snake[0].y < -this.world.height){
              //  this.triggerDeath();
            }
        }
    }
    
    triggerDeath(){
        //this.togglePauze();
        this.geometry.clearAll();
        this.pauzed = true;
        this.isDeath = true;
        this.deathAnimimationFrame = 0;
    }
    reset(){
  //   this.scene.dispose();   
     this.geometry.clearAll();
 //    this.scene = new Scene(this.engine);
      this.gui.removeDeathNote();
      this.showMainMenu = true;
      window.location.reload();
    }
    
    createBoundingBox(){ 
        var width = 0.02;
        
        var zIndex = -1;
        
        var mwidth = this.world.width;
        var mheight = this.world.height;
        
        var red = 0.8;
        var white = 0.3;
        for(var i = 0 ; i < 9; i ++){
            var points = [
                new BABYLON.Vector3(-mwidth,-mheight,zIndex),
                new BABYLON.Vector3(mwidth,-mheight,zIndex),
                new BABYLON.Vector3(mwidth,mheight,zIndex),
                new BABYLON.Vector3(-mwidth,mheight,zIndex),
                new BABYLON.Vector3(-mwidth,-mheight,zIndex),
                new BABYLON.Vector3(-mwidth - width,-mwidth - width,zIndex),
                new BABYLON.Vector3(mwidth + width,-mwidth - width,zIndex),
                new BABYLON.Vector3(mwidth + width,mwidth + width,zIndex),
                new BABYLON.Vector3(-mwidth - width,mwidth + width,zIndex),
                new BABYLON.Vector3(-mwidth - width,-mwidth - width,zIndex)
            ];
            var filled_hex = BABYLON.Mesh.CreateRibbon("boundingHex",[points],true,false,0,this.scene);
            
            if(i == 0){
                this.material.setColor(new BABYLON.Color3(red,0,0));
            }else{
                this.material.setColor(new BABYLON.Color3(white,white,white));
            }
            var mat = this.material.createMaterial("boundingMat");
            filled_hex.material = mat;
            
            zIndex --;
            white -= 0.025;
            mwidth -= width * i;
            mheight -= width * i;
        }
    }
    createSnake() {
        var length = 1;

        var addLength = 0.0001;
        var currentLength = 0;
        
        var r = Math.random() * 0.8 + 0.5;
        var g = Math.random() * 0.8 + 0.5;
        var b = Math.random() * 0.8 + 0.5;
        
        
        var headColor =  new BABYLON.Color3(r, g, b);     
   /*     
        var rx = (Math.random() * (20 + 20)) - 20;
        var ry = (Math.random() * (20 + 20)) - 20;
        */
        for (var i = 0; i < length; i++) {
            this.snake.push(new BABYLON.Vector3(0, currentLength, 0));   
            
            this.snakeColor.push(headColor);
            
            currentLength += addLength;
        }
        this.socket.emit('player-connect', {x: this.snake[0].x, y: this.snake[0].y, angle: this.currentAngle, nickName: this.nickName, uuid: this.uuid});
    }
    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
    }
    drawScore(){
        this.gui.setScore(this.snake.length);
    }
    drawSnakeEyes(position : BABYLON.Vector3,angle:number,index : number){
        var colorW = new BABYLON.Color3(1,1,1);
        var colorB = new BABYLON.Color3(0,0,0);
        
        var offset = 0.5;
        var offsetIris = 0.5;
        
        var radius = 0.025
        var radiusIris = 0.015;
        
        var radiusOffset = -0.04;
        
        
        
        var frontPosX1 = radiusOffset * Math.cos((angle - offset));
        var frontPosY1 =radiusOffset * Math.sin( (angle - offset));
        var p1 = new BABYLON.Vector3(position.x,position.y,position.z+0.1);
        p1.x += frontPosX1;
        p1.y += frontPosY1;
        this.drawCircle(p1,radius,colorW,index);
        index++;   
        
        
        var x1 = this.mouse.x + p1.x ;
        var y1 = this.mouse.y + p1.y;

        var x2 = p1.x;
        var y2 = p1.y;
        
        var dx = x1 - x2;
        var dy = y1 - y2;
        
        var rad = Math.atan2(dx,dy);

        var frontPosXIris1 = radiusIris * Math.cos(angle);
        var frontPosYIris1 = radiusIris  * Math.sin(angle);
        var p1Iris = new BABYLON.Vector3(p1.x,p1.y,p1.z);
        p1Iris.x += frontPosXIris1 - 0.004;
        p1Iris.y += frontPosYIris1 - 0.004;
        this.drawCircle(p1Iris,radiusIris,colorB,index);
        
        index++;   
        
        
        var frontPosX2 = radiusOffset * Math.cos((angle + offset));
        var frontPosY2 = radiusOffset * Math.sin( (angle + offset ));
        
        
        var p2 = new BABYLON.Vector3(position.x,position.y,position.z+0.1);
        p2.x += frontPosX2;
        p2.y += frontPosY2;
        this.drawCircle(p2,radius,colorW,index);
        index++;
        
        
        
        var frontPosXIris2 = radiusIris  * Math.cos(angle );
        var frontPosYIris2 = radiusIris * Math.sin(angle );
        var p2Iris = new BABYLON.Vector3(p2.x,p2.y,p2.z);
        p2Iris.x += frontPosXIris2 - 0.004;
        p2Iris.y += frontPosYIris2 - 0.004;
        this.drawCircle(p2Iris,radiusIris,colorB,index);
        
        index++;   
        
        
        return index;
    }
    
    
    
    
    drawSnake() {
        var fraction = 1;
        
        this.playerFrameDTSub -= this.engine.getDeltaTime(); 
        if(this.playerFrameDTSub > 0){
            fraction = 1 - (this.playerFrameDTSub / this.playerFrameDT);
        }
        var snake = null;
        var c = 0;
        var color = new BABYLON.Color3(1,1,1);
        
            //    console.log(this.playerFrames);
        for (var i = 0; i <  this.players.length; i++) {
            if(this.players[i]){
                if(this.players[i].color){
                    color = new BABYLON.Color3(this.players[i].color.r,this.players[i].color.g,this.players[i].color.b);
                }
                var r = 0.025;
               // console.log(i);
                if(this.playerFrames[this.players[i].uuid]){
                    snake = this.playerFrames[this.players[i].uuid][0];
                    var snakep2 = this.playerFrames[this.players[i].uuid][1];
                    if(i >0){
                    //    console.log(snake);
                    }
                    if(snake && snakep2){
                       if (!this.players[i].color){
                           // this.players[i].color = new BABYLON.Color3(1, 1, 1);
                        }
                        for (var j = 0; j < snake.length; j++){
                            var lerpPos = this.lerpPosition(snake[j],snakep2[j],fraction);
                            if(this.players[i].uuid == this.uuid){
                                if(j == 1){            
                                    this.snake[0].x = lerpPos.x;
                                    this.snake[0].y = lerpPos.y;    
                                }
                            }
                            this.drawCircle(lerpPos, r,color ,c);
                            c++;
                        }
                    }
                }
            }
            c + 1000;
        }
    }
    checkGUIState(){
        console.log('checkGUISTATE!');
        if(!this.showMainMenu){
            this.pauzed = false;
            this.nickName = this.gui.getNickName();
            this.createSnake();
            
            this.gui.removeMainMenuElements();
            this.gui.createScore();
        }else{
            this.gui.createMainMenuText();
            this.gui.createMainMenuTextField();
            this.gui.createMainMenuPlayButton();
        }
    }
    update() {
        this.frameCnt ++;
        
        if(this.showMainMenu && this.gui.getValidPlayState()){
           this.showMainMenu = false;
           this.checkGUIState();
        }
        if(!this.pauzed && this.snake[0] && !this.showMainMenu){
	   // this.food.createFood();
            var x1 = this.mouse.x + this.snake[0].x ;
            var y1 = this.mouse.y + this.snake[0].y;

            var x2 = this.snake[0].x;
            var y2 = this.snake[0].y;

            var dx = x1 - x2;
            var dy = y1 - y2;
            var angle = Math.atan2(dy, dx);
            
            var dampening = 0;
            var angleDiff = angle - this.currentAngle;
            
            var angleDiff = 0;
            
            if(angle > this.currentAngle){
                angleDiff = angle - this.currentAngle;
            }else if(angle < this.currentAngle){
                angleDiff = this.currentAngle - angle;
            }
            
            var angularDrag = 0.25;
            var maxAngleChange = 0.1;
            if(this.currentAngle){
                if(angleDiff  > maxAngleChange || angleDiff < -maxAngleChange){
                    var dampening = angleDiff * angularDrag;
                    angle * dampening;
                }
            }
            this.currentAngle = angle;
            
            
            this.socket.emit('move-player', {x: this.snake[0].x, y: this.snake[0].y, angle: this.currentAngle});
            
            this.scene.camera.setTarget(this.snake[0]);
            
            
	    this.food.drawFood();
            this.drawSnake();
            if(this.isDeath){
                if(!this.gui.getDeathNote()){
                    this.gui.showDeathNote();
                }
                if(this.deathAnimimationFrame < 500){
                    var transp = this.deathAnimimationFrame / 100;
                    var fadeLevel = 1 - transp;
                    this.fadeLevel = fadeLevel; 
                    this.deathAnimimationFrame ++;



                }else{
                    this.reset();
                }
            }
        } 
        
        
        
        return this.scene;
    }
}
var game = new Game();

