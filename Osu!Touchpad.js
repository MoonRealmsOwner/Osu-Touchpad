//includes
var app = require('express')();
var path = require('path');
var html = require('http').Server(app);
var io = require('socket.io')(html);
var robot = require('robotjs');
var ip = require('ip');
var parser = require('ua-parser-js');

//constants
var HTML_PATH = "/index.html";
var CSS_PATH = "/html deps/index.css"
var HAMMER_PATH = "/lib/hammer.min.js";
var NOBOUNCE_PATH = "/lib/inobounce.min.js";
var HTML_JS_PATH = "/html deps/index.js";
var PORT = 3000;
var iOS_Y_COMP = 97;

//global
var ua_data;

//lets load that html file
app.get('/', function(req, res)
{
	//lets get that header
	ua_data = parser(req.headers['user-agent']);
	console.log("OS: " + ua_data.os.name);

	//index.html
	res.sendFile(path.join(__dirname + HTML_PATH) );
})

app.get('/hammer.min.js', function(req, res)
{
	//hammer.min.js
	res.sendFile(path.join(__dirname + HAMMER_PATH) );
})

app.get('/index.js', function(req, res)
{
	//index.js
	res.sendFile(path.join(__dirname + HTML_JS_PATH) );
})

app.get('/index.css', function(req, res)
{
	//index.css
	res.sendFile(path.join(__dirname + CSS_PATH) ); 
})

//sockest
io.on('connection', function(socket)
{
	var client_w, client_h;
	var w_ratio, h_ratio;
	console.log("A user connected");

	//send verification message
	io.emit('verify', {});

	socket.on('verify', function(data)
	{
		//verfify connection
		console.log("Verfied connection to client!");
	})

	//lets grab that screen width & height
	//key is SCREEN_DIMENSION
	socket.on('SCREEN_DIMENSION', function(data)
	{
		client_w = data.W;
		client_h = data.H;

		console.log("Found screen width of " + client_w.toString() );
		console.log("Found screen height of " + client_h.toString() );

		//lets calculate what the proportional thing would be on the server's screen
		//I <3 RobotJS!
		var screen_size = robot.getScreenSize();

		w_ratio = (screen_size.width / client_w);
		h_ratio = (screen_size.height / client_h);

		console.log("Found a server screen width of " + screen_size.width);
		console.log("Found a server screen height of " + screen_size.height)
		console.log("Found a width ratio of " + w_ratio.toString() );
		console.log("Found a height ratio of " + h_ratio.toString() );

	})

	//Key is TOUCHPOS
	socket.on('TOUCHPOS', function(data)
	{
		var touch_x = data.X;
		var touch_y = data.Y;

		//iOS returns negative? coordinates which is strange.
		if(ua_data.os.name == 'iOS')
		{
			touch_y += iOS_Y_COMP;
		}

		console.log("X: " + touch_x.toString() );
		console.log("Y: " + touch_y.toString() );

		//did I mention I <3 RobotJS?
		robot.moveMouse(touch_x * w_ratio, touch_y * h_ratio);

		console.log("Calc X: " + (touch_x * w_ratio).toString() );
		console.log("Calc Y: " + (touch_y * h_ratio).toString() )
	})
})

html.listen(PORT, "0.0.0.0", function()
	{
		console.log("Running @ " + ip.address() + ":" + PORT.toString() );
	});

console.log("CTRL + C TO EXIT OUT");