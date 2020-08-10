import * as express from 'express';
import * as socketIo from 'socket.io';
import { createServer, Server} from 'http';
import {Food} from './food';
import {Collision} from './collision';

class NodeServer{
    private app : express.Application;
    private io: socketIo.Server;
    private port: number = 5000;
    private server: Server;
    private players: any = [];
    
    private serverFPS : number = 20;
    
    private initSnakeLength : number = 10;
    
    private world : {width: number ,height: number};
    
    //additional class modules
    
    private food : Food;
    private collision: Collision;
    
    
    
    constructor(){        
        this.world = {
            width : 10,
            height : 10
        };
        
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
            
                console.log('Player connected!');
                console.log(state);
            
               self.players[socket.id] = state;
               // Broadcast a signal to everyone containing the updated players list
               self.io.emit('update-players',self.players);
       });
    }
    onPlayerDisconnect(socket:socketIo.Socket){
        var self = this;  
        socket.on('player-disconnect',function(state){
            delete self.players[socket.id];
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

            self.io.emit('update-players',self.players);
        });
    }
    initServerLoop():void{
        
        var self = this;
        setInterval(function () {
            self.gameLoop(self);
        }, 1000 / this.serverFPS);
    }
    
    gameLoop(self:NodeServer){
        this.food.createFood();
        this.io.emit('update-food', this.food.getFood());
        
        
        if(this.players.length > 0){
        console.log(this.players);
        console.log(this.players.length);
            throw new Error('dbg');
        }
        for(var i = 0; i < this.players.length; i++){
            this.collision.collisionFood(this.players[i]);
        }
    }
}
var nodeServer = new NodeServer();