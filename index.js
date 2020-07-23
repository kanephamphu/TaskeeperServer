var express = require("express");
var app = express();
var path=require("path");
var bodyparser=require("body-parser");
var server= require("http").createServer(app);
var io=require("socket.io").listen(server);
var mongoose = require("mongoose");
var nodemailer= require("nodemailer");
var config = require('./config/default.json');
var userController = require('./controllers/UsersController');
var jwt= require('jsonwebtoken');
app.set('view engine','ejs');
app.set('views','./views');
app.use(express.static('public'));

app.get('/',(req,res)=>res.render('home'));
var options={
    service: 'Gmail',
    auth:{
        user: 'nowayit69@gmail.com',
        pass: 'Anhphutai0159'
    }
};
var transporter=nodemailer.createTransport(options);

server.listen(process.env.PORT || 3000);
app.use(bodyparser.json());
mongoose.connect(config.ConnectMongo).then(
	()=>{
		console.log("Connect DB succesfully");
	},
	err=>{
		console.log("Failed to connect to database");
	}
);


io.sockets.on('connection',function(socket){
	socket.token=''
	console.log(socket.id+" is connecting");
	//Login server listener, if the account status is unActive send result unActive to client
	socket.on("cl-send-login-req", async function(data){
		try{
			const result = await userController.checkLogin(data.loginquery,data.password);
			if(result =='success'){
				jwt.sign(data,config.login_secret_key,(err,token)=>{
						socket.token = token;
						console.log(socket.token);
						var loginresult = {
							"result" : result,
							"secret_key" : socket.token
						}
						socket.emit("sv-send-login-res",loginresult);
				});
			}else{
				var loginresult = {
					"result" : result
				}
				socket.emit("sv-send-login-res",loginresult);
			}
		}catch(e){
			console.log(e);
			throw(e);
		}
		
	});
	//Client send logout request
	socket.on("client-send-logout-request",(token)=>{
		if(socket.token==token)
			console.log("authenticated")
	});
	//Client send register request
	socket.on("cl-send-register-req",async (data)=>{
		try{
			var result = await userController.register(data.first_name,data.last_name,data.email,data.phone_number,data.password);
			console.log(result);
			socket.emit("sv-send-register-res",{"result" : result });
		}catch(e){
			console.log(e);
			throw(e);
		}
	});

	//Disconnect
	socket.on('disconnect', function () {
		console.log(socket.id+" disconnected");
	});
});
app.get('/',(req,res)=>{
	res.response("Server Thoy Mey Ben Oyyy");
});

app.post('/api/posts',verifyToken, (req,res)=>{
	jwt.verify(req.token, 'secretkey', (err,authData)=>{
		if(err){
			res.sendStatus(403);
		}else{
			res.json({
				message: 'Post new app',
				authData
			});
		}
	})
});



  