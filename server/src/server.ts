import * as express from 'express';
import * as socketIo from 'socket.io';
import { createServer, Server} from 'http';
import {Food} from './food';
import {Collision} from './collision';
import {Snake} from './snake';

class NodeServer{
    private app : express.Application;
    private io: socketIo.Server;
    private port: number = 5000;
    private server: Server;
    private players: Array<{
        score : number
        nickName : string,
        snake : any,
        x : number,
        y : number,
        angle : number
        uuid : string,
        color : BABYLON.Color3,
        velocity : any
    }> = [];
    
    private serverFPS : number = 20;
    
    private world : {width: number ,height: number};
    
    //additional class modules
    
    private food : Food;
    private collision: Collision;
    private snake : Snake;
    
    
    constructor(){        
        this.world = {
            width : 6,
            height : 6
        };
        
        this.snake = new Snake();
        this.food = new Food(this.world);
        this.collision = new Collision(this.world);
        
        this.app = express();
        
        this.server = createServer(this.app);
        
        this.initSocket();
        this.listen();
        
        this.initServerLoop();
        
    }
    
    initSocket():void{
        this.io = socketIo(this.server,{ serveClient: false });
    }
    listen():void{
        
        var self = this
        this.server.listen(this.port,function(){
            console.log('Running server on port %s', self.port);
        });
        this.io.on('connection', function (socket: socketIo.Socket){
           console.log('achieved client connection! '+socket.id);
           self.onPlayerConnect(socket);
           self.onPlayerDisconnect(socket);
           self.onPlayerMove(socket);
        });
    }
    onPlayerConnect(socket:socketIo.Socket){
        var self = this;  
        socket.on('player-connect',function(state:any){            
                self.players[socket.id] = {};
                console.log('Player connected!');
                console.log(state);
            
               self.players[socket.id] = state;
               self.players[socket.id].score = 0;
               self.players[socket.id].snake = [];
               self.players[socket.id].velocity = {};
                var cr = (Math.random() * 1) + 0.5;
                var cg = (Math.random() * 1) + 0.5;
                var cb = (Math.random() * 1) + 0.5;
                    
               self.players[socket.id].color = new BABYLON.Color3(cr,cg,cb);
               // Broadcast a signal to everyone containing the updated players list
               //self.io.emit('update-players',self.players);
       });
    }
    onPlayerDisconnect(socket:socketIo.Socket){
        var self = this;  
        socket.on('player-disconnect',function(state){
            console.log('Player disconnected!');
            if(self.players[socket.id]){
                delete self.players[socket.id];
            }
            self.io.emit('update-players',self.players);
        });
        socket.on('disconnect',function(state){
            console.log('Player disconnected!');
             if(self.players[socket.id]){
                delete self.players[socket.id];
             }
            self.io.emit('update-players',self.players);
        });
    }
    onPlayerMove(socket:socketIo.Socket){
        var self = this;  
        
        socket.on('move-player',function(position_data){
            
            if(self.players[socket.id] === undefined){ 
                return;
            }
            
            
            self.players[socket.id].x = position_data.x;  
            self.players[socket.id].y = position_data.y; 
            self.players[socket.id].angle = position_data.angle; 
        //    self.io.emit('update-players',self.players);
        });
    }
    initServerLoop():void{
        
        var self = this;
        setInterval(function () {
            self.gameLoop();
        }, 1000 / this.serverFPS);
    }
    
    updateScorePlayers(){
        var scores = [];
        
        var topScore = 0;
        
        var i = 0;
        for(var key in this.players){
            if(this.players.hasOwnProperty(key)){
                var scoreArr = {'nickName':this.players[key].nickName,'score':this.players[key].score};
                
                scores[i] = scoreArr;
                i++;
            }
        }
        scores.sort((a, b) => (b.score  > a.score) ? 1: -1);       
        this.io.emit('update-players-score',scores);
    }
    
    gameLoop(){
        this.food.createFood();
        this.io.emit('update-food', this.food.getFood());
        
      /*  for(var i = 0; i < this.players.length; i++){
            this.collision.collisionFood(this.players[i]);
        }*/
        
        var players = [];
        
        var i = 0;
        for(var key in this.players){
            if(this.players.hasOwnProperty(key)){
                
                var atePoints = this.collision.collisionFood(this.players[key], this.food);
                
                if(atePoints > 0){
                   this.players[key].score += atePoints;
                   this.snake.addLengthPlayerSnake(key,atePoints);
                   this.updateScorePlayers();
                }
                this.players[key].snake = this.snake.getPlayerSnake(key);
                this.players[key].velocity = this.snake.getPlayerVelocity(key);
                
                var p2 = this.collision.collisionPlayer(this.players[key],this.players);
                
                if(p2){
                    this.players[p2].score += Math.floor(this.players[key].snake.length /2);
                    this.snake.addLengthPlayerSnake(p2,this.players[key].snake.length / 2);
                    this.io.emit('dead-player',this.players[key]);
                    delete this.players[key];
                    this.io.emit('update-players',this.players);
                    this.updateScorePlayers();
                }
                
                var oob = this.collision.collisionOOB(this.players[key]);
                if(oob){
                    console.log('OOB!');
                    this.io.emit('dead-player',this.players[key]);
                    delete this.players[key];
                    this.io.emit('update-players',this.players);
                    this.updateScorePlayers();
                }
                
                
                players[i] = this.players[key];
                i++;
            }
        }
        this.snake.updateSnakePlayers(this.players);
       // this.players[i].velocity = velocity;
        this.io.sockets.emit('update-players',players);
    }
}
var nodeServer = new NodeServer();