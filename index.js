var express = require("express");
var app = express();
var server= require("http").createServer(app);
var io=require("socket.io").listen(server);
var config = require('./config/default.json');
var bodyparser = require('body-parser');
var userController = require('./controllers/UsersController');
var jwt= require('jsonwebtoken');
server.listen(process.env.PORT || 3000);
app.use(bodyparser.json());


io.sockets.on('connection',function(socket){
	socket.token=''
	console.log(socket.id+" is connecting");
	//Login server listener, if the account status is unActive send result unActive to client
	socket.on("cl-send-login-req", async function(data){
		try{
			const result = await userController.checkLogin(data.loginquery,data.password);
			if(result =='success'){
				const ID = await userController.getUserID(data.loginquery);
				const INFORMATION = await userController.getInformation(ID);
				const tokenInformation = {
					"_id" : ID,
					"username" : INFORMATION.login_information.username,
					"password" : INFORMATION.login_information.password,
					"email" : INFORMATION.email.current_email,
					"phone_number" : INFORMATION.phone_number.current_phone_number
				};
				jwt.sign(tokenInformation,config.login_secret_key, { expiresIn: 60*60*2 },(err,token)=>{
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

	//Get token decode 
	socket.on("cl-send-token-decode", async(data)=>{
		try{
			jwt.verify(data,config.login_secret_key,(err,decoded)=>{
				if(err) 
					console.log(err);
				if(decoded)
				{
					console.log(decoded);
					socket.emit("sv-send-token-decode",decoded);
				}
				
			})
			
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


app.get('/',(req,res)=>
	res.send('Server Thoy Mey Ben Oyyy')
);





  