var settings = require('./settings.json');
var express = require('express');
var socket = require('socket.io');
var http = require('http');
var path = require('path');
var socket = require('socket.io');
var cm = require('./modules/restmodules/channels');
var rauth = require('./modules/restmodules/auth');
var user_utils = require('./modules/utils/user');
var app = express();

var emit = function(room,type,message) {
        var to = room || "global";
        if(io.sockets){
            io.sockets.in(to).emit(type,message);
        }   
}; 

var user = new user_utils();
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.static(path.join(__dirname,'public')));

var socketServer = http.createServer(app);
var io = require('socket.io').listen(socketServer);

io.sockets.on('connection',function(socket){
	
  //console.log(socket);
  socket.join('global');

	// On a command, lookup the appropriate module and call execute on it. The
	// arguments for execute should always be the same.
	socket.on('command', function (data) {
		try {
        // Remember the command already has an / in it
    		var cmd = require('./modules/commands'+data.command.toLowerCase());
    		var context = {
	    		sockets: io.sockets,
          command: data.command,
          user: data.user,
          args: data.args,
          channel: data.channel,
          socket: socket,
          timestamp: new Date().toJSON()
	    	};

	    	cmd.execute(context,function(data){
	    		console.log(data);
	    	});

    	} catch(e) {
    		console.log("Command not found: "+e);
    		emit("global","info","Command not found");
    	}

    
  	});
});

// HTTP Definitions
// TODO: Refactor these somewhere more elegant

app.get('/rooms/list', function(req,res){
  cm.getActiveRooms(req,res,io.sockets);
});

app.get("/rooms/:room", function(req,res){
  cm.getSocketsInRoom(req,res,io.sockets);
});

app.post("/users/authenticate",rauth.authenticateUser);

app.get('/health', function(req, res){
  var body = 'ok';
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', body.length);
  emit('health-check',{success: true});
  res.end(body);
});

app.get('/login', function(req,res){
    res.sendfile('./modules/views/login.html');
});

app.get('/logout', function(req,res){
    res.clearCookie('sec',null);
    res.redirect('/login');
});

app.get('/', function(req, res){
    if(req.cookies){
        if(req.cookies.sec){
            res.sendfile('./modules/views/index.html');
        } else {
            res.redirect('/login');
        }
    }

});


socketServer.listen(8080);

console.log('Listening on port 8080, use http://localhost:8080/health to test.');