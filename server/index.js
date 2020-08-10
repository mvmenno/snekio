var express = require('express'); // Express contains some boilerplate to for routing and such
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http); // Here's where we include socket.io as a node module 

app.set('port', (process.env.PORT || 5000));
http.listen(app.get('port'), function(){
  console.log('listening on port',app.get('port'));
});
var players = {}; 

io.on('connection', function(socket){
    
    socket.on('new-player',function(state){
            players[socket.id] = state;
            // Broadcast a signal to everyone containing the updated players list
            io.emit('update-players',players);
            
            console.log(state);
            
    })
    socket.on('disconnect',function(state){
        delete players[socket.id];
        io.emit('update-players',players);
    });
    
    socket.on('move-player',function(position_data){
        if(players[socket.id] == undefined){ 
            return;
        }
        players[socket.id].x = position_data.x;  
        players[socket.id].y = position_data.y; 
        players[socket.id].angle = position_data.angle; 
        
       // console.log(position_data);
        io.emit('update-players',players);
    });
});