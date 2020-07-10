import * as BABYLON from 'babylonjs';
import {Scene} from './scene';
import {Line2D} from './line2d';
import {Geometry} from './geometry';
import {Material} from './material';
import {Gui} from './gui';

class Game {
    
    private canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    private engine: BABYLON.Engine;
    private scene: Scene;
    private snake: Array<BABYLON.Vector3> = [];
    private points: Array<{vector: BABYLON.Vector3, color: BABYLON.Color3}> = [];
    private snakeColor: Array<BABYLON.Color3> = [];
    private geometry: Geometry;
    private material: Material;
    private gui: Gui;
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
    
    
    constructor() {
        
        this.engine = new BABYLON.Engine(this.canvas, true);

        this.scene = new Scene(this.engine);
        /*
        BABYLON.Effect.ShadersStore["fadePixelShader"] =
                        "precision highp float;" +
                        "varying vec2 vUV;" +
                        "uniform sampler2D textureSampler; " +
                        "uniform float fadeLevel; " +
                        "void main(void){" +
                        "vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;" +
                        "baseColor.a = 1.0;" +
                        "gl_FragColor = baseColor;" +
	"}";
        
        this.postProcess = new BABYLON.PostProcess("Fade", "fade", ["fadeLevel"], null, 1.0, this.scene.camera);
        this.postProcess.onApply = (effect) => {
            effect.setFloat("fadeLevel", this.fadeLevel);
        };
        */
        this.material = new Material(this.scene);
        this.geometry = new Geometry(this.scene,this.material);
        this.gui = new Gui();
        
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
            width : 3,
            height : 3
        };
        
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
        this.createSnake();
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


    checkCollision() {
        if(this.snake[0] && this.frameCnt > 50){
            var snakePos = this.snake[0];

            var x1 = snakePos.x;
            var y1 = snakePos.y;
            for (var i = 0; i < this.points.length; i++) {
                var point = this.points[i];

                var distance = Math.sqrt(Math.pow(x1 - point.vector.x, 2) + Math.pow(y1 - point.vector.y, 2));
                if (distance < 0.075) {
                    this.points.splice(i, 1);
                    this.snakeColor.push(new BABYLON.Color3(Math.random(), Math.random(), Math.random()));
                    this.snake.push(new BABYLON.Vector3(0, this.snake.length * 0.0001, 0));
                }
            }


            for(var i = this.snake.length -1; i >= 4; i --){
                var point2 = this.snake[i];
                var distance = Math.sqrt(Math.pow(x1 - point2.x, 2) + Math.pow(y1 - point2.y, 2));


                if (distance < 0.025) {
                    this.triggerDeath();

                    break;
                }
            }

            if(this.snake[0].x > this.world.width || this.snake[0].x < -this.world.width){
                this.triggerDeath();
            }
            if(this.snake[0].y > this.world.height || this.snake[0].y < -this.world.height){
                this.triggerDeath();
            }
        }
    }
    
    triggerDeath(){
        //this.togglePauze();
        this.pauzed = true;
        this.isDeath = true;
        this.deathAnimimationFrame = 0;
    }
    reset(){
  //   this.scene.dispose();   
     this.geometry.clearAll();
 //    this.scene = new Scene(this.engine);
      this.gui.removeDeathNote();
     
     this.init();
    }
    
    createBoundingBox(){ 
        var width = 0.2;
        
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
                new BABYLON.Vector3(-mwidth - width,-mwidth - width,zIndex),



            /*    new BABYLON.Vector3(-this.world.width - width,-this.world.height - width,0),
                new BABYLON.Vector3(this.world.width + width,-this.world.height - width,0),
                new BABYLON.Vector3(-this.world.width - width,this.world.height + width,0),
                new BABYLON.Vector3(this.world.width + width,this.world.height + width,0)*/
            ];

           //var hex = BABYLON.Mesh.CreateLines("boundingHex",points,this.scene);
            var filled_hex = BABYLON.Mesh.CreateRibbon("boundingHex",[points],true,false,0,this.scene);
            
            if(i == 0){
                this.material.setColor(new BABYLON.Color3(red,0,0));
            }else{
                this.material.setColor(new BABYLON.Color3(white,white,white));
            }
            var mat = this.material.createMaterial("boundingMat");

          //  filled_hex.color = new BABYLON.Color3(1,0,0);
            filled_hex.material = mat;
            
            zIndex --;
            white -= 0.025;
            mwidth -= width * i;
            mheight -= width * i;
        }
        
        
        
        
    }
    createSnake() {
        var length = 3;

        var addLength = 0.0001;
        var currentLength = 0;
        
        var headColor =  new BABYLON.Color3(Math.random(), Math.random(), Math.random());     
        for (var i = 0; i < length; i++) {
            this.snake.push(new BABYLON.Vector3(0, currentLength, 0));   
            
            this.snakeColor.push(headColor);
            
            currentLength += addLength;
        }
    }
    drawScore(){
        this.gui.setScore(this.snake.length);
    }
    drawSnake() {
        var r = 0;
        for (var i = 0; i < this.snake.length; i++) {
            if(i < 3){
                r = 0.05;
            }else{
                r = 0.025;
            }
            
            this.drawCircle(this.snake[i], r, this.snakeColor[i],i + 1000);
        }
    }
    createPoints() {
        while (this.points.length < 500) {
            var maxWidth = this.world.width * 2;
            var maxHeight = this.world.height * 2;

            var posX = (Math.random() * maxWidth)  - (maxWidth / 2);
            var posY = (Math.random() * maxHeight) - (maxHeight / 2);
            var point = {
                vector: new BABYLON.Vector3(posX, posY, 0),
                color: new BABYLON.Color3(0.31, 0.75, 0.43)
            };
            this.points.push(point);
        }
    }
    drawPoints() {
        for (var i = 0; i < this.points.length; i++) {
            var point = this.points[i];
            this.drawCircle(point.vector, 0.025, point.color,(this.snake.length + i));
        }
    }
    update() {
        this.frameCnt ++;

        if(!this.pauzed && this.snake[0]){
            this.createPoints();
            
            var x1 = this.mouse.x + this.snake[0].x ;
            var y1 = this.mouse.y + this.snake[0].y;

            var x2 = this.snake[0].x;
            var y2 = this.snake[0].y;

            var dx = x1 - x2;
            var dy = y1 - y2;
            
            
            var distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
            
            var angle = this.currentAngle;
            
            angle = Math.atan2(dy, dx);
            
            
           // angle = angle / distance;
            
            var maxAngle = 1;
            
           // var dampening =  (angle * distance) * distance;
            
            var dampening = 0;
            var angleDiff = angle - this.currentAngle;
            
            if(distance > 0){
            
                dampening = (angle / distance) * (0.00085);
            }
            angle += dampening;
            
            var d = 0.05;

            var snake = this.snake;

            var force = 0.0010 * this.engine.getDeltaTime();
            
            this.velocity.x = force * Math.cos(angle);
            this.velocity.y = force * Math.sin(angle);

            var angularDrag = 0.005;


            for (var i = snake.length - 1; i >= 1; i--) {
                
               var sf = i / snake.length * 0.02;
                
                this.snake[i].x = (this.snake[i - 1].x ) - d * (Math.cos(angle + (angle * angularDrag)));
                this.snake[i].y = (this.snake[i - 1].y ) - d * (Math.sin(angle + (angle * angularDrag)) );
            }


            for (var j = 0; j < snake.length; j++) {
                
                this.snake[j].x += this.velocity.x;
                this.snake[j].y += this.velocity.y;
            }
           // this.camera.position.x = this.snake[0].x * 100;
          //  this.camera.position.y = this.snake[0].y * 100;
          /*
            this.postProcess.onApply = (effect) => {
                effect.setFloat("fadeLevel", this.fadeLevel);
            };	
            */
            //this.camera.setTarget = this.snake[0];
            this.scene.camera.setTarget(this.snake[0]);

            this.checkCollision();
            this.drawPoints();
           
        } 
        this.drawSnake();
        this.drawScore();
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
        
        return this.scene;
    }
}
var game = new Game();

