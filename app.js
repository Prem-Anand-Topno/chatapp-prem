var express = require("express"),
    app = express(),
    path=require('path'),
  	cookieParser = require('cookie-parser'),
  	session = require('express-session'),
  	config = require('./config/config.js'),
  	ConnectMongo = require('connect-mongo')(session),
  	mongoose = require('mongoose').connect(config.dbURL),
  	passport = require('passport'),
  	FacebookStrategy = require('passport-facebook').Strategy,
  	rooms = [];

app.set('views',path.join(__dirname,'views'));//setting path for views
app.engine('html',require('hogan-express'));//using hogan-express engine for html
app.set('view engine','html');//setting view engine
app.use(express.static(path.join(__dirname,'public')));//setting path for static files
app.use(cookieParser());//for session
var env=process.env.NODE_ENV || 'development';
if(env=='development'){
	//dev specific settings to be saved in local memory
	app.use(session({secret:config.sessionSecret,saveUninitialized:true,resave:true}));
}
else{
	//production specific settings to be saved in mongodb
	app.use(session({
		secret:config.sessionSecret,
		store:new ConnectMongo({
			//url:config.dbURL,
			mongoose_connection:mongoose.connections[0],
			stringify:true
		}),
		saveUninitialized:true,
		resave:true,
	}));
}

app.use(passport.initialize());
app.use(passport.session());

require('./auth/passportAuth.js')(passport,FacebookStrategy,config,mongoose);
require('./routes/routes.js')(express,app,passport,config,rooms);//for handeling routes get or post

/*app.listen(3000,function(){
  	console.log("ChatCat working on port 3000");
  	console.log("Mode "+env);
 });*/
 app.set('port',process.env.PORT || 3000);
 var server = require('http').createServer(app);
 var io = require('socket.io').listen(server);

 require('./socket/socket.js')(io,rooms);

 server.listen(app.get('port'),function(){
 	console.log("ChatCat running on port :"+app.get('port'));
 	console.log("Mode "+env);
 })