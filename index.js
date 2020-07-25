var express = require("express");
var app = express();
var server= require("http").createServer(app);
var io=require("socket.io").listen(server);
var config = require('./config/default.json');
var bodyparser = require('body-parser');
var userController = require('./controllers/UsersController');
var jwt= require('jsonwebtoken');
var checker = require('./controllers/Check')
var tasksController = require('./controllers/TaskController');
const tasks = require("./models/TasksModel");
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
				jwt.sign(tokenInformation,config.login_secret_key, { expiresIn: 60*60*24 },(err,token)=>{
						if(err){
							console.log(err);
						}
						socket.auth = true;
						console.log(token);
						var loginresult = {
							"result" : result,
							"secret_key" : token
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
			socket.emit("sv-send-login-res",{"result" : "error"});
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
			var result = await userController.register(data.first_name,data.last_name,data.email,data.phone_number,data.password,data.day,data.month,data.year);
			console.log(result);
			socket.emit("sv-send-register-res",{"result" : result });
		}catch(e){
			socket.emit("sv-send-register-res",{"result" : "error"});
			console.log(e);
			throw(e);
		}
	});

	//Get token decode 
	socket.on("cl-send-token-decode", async(data)=>{
		try{
			jwt.verify(data,config.login_secret_key,(err,decoded)=>{
				if(err) 
					socket.emit("sv-send-token-decode",{"result":"token-error"});
				if(decoded)
				{
					console.log(decoded);
					socket.emit("sv-send-token-decode",decoded);
				}
				
			})
			
		}catch(e){
			socket.emit("sv-send-token-decode",{"result" : "error"});
			throw(e);
		}
	});

	//Change password
	socket.on("cl-change-password",(data)=>{
		try{
			jwt.verify(data.secret_key,config.login_secret_key,async (err,decoded)=>{
				if(err) 
					socket.emit("sv-change-password",{"result":"token-error"});
				if(decoded)
				{
					if( checker.encrypt(data.old_password) == decoded.password){
						if(data.new_password == data.verify_password){
							var changepassword = await userController.changePassword(decoded._id,data.new_password);
							if(typeof changepassword !== undefined){
								socket.emit("sv-change-password",{"result" : "success"});
							}else{
								socket.emit("sv-change-password",{"result" : "error"});
							}
						}else{
							socket.emit("sv-change-password",{"result" : "two-password-not-similar"});
						}
					}else{
						socket.emit("sv-change-password",{"result" : "wrong-password"});
					}
				}
				
			})
		}catch(e){
			socket.emit("sv-change-password",{"result" : "error"});
			throw(e);
		}
	})

	//Add new tasks
	socket.on("cl-new-tasks",(data)=>{
		try {
			console.log(data.secret_key);
			jwt.verify(data.secret_key,config.login_secret_key,async (err,decoded)=>{
				if(err){
					console.log(err);
					socket.emit("sv-new-tasks",{"result":"token-error"})
				}
				if(decoded){
					if(typeof data.price_type !== 'undefined'){
						if(data.price_type == 'unextract'){
							if(data.floor_price >= data.ceiling_price){
								socket.emit("sv-new-tasks", {"result" : "price-error"})
							}else{
								var result = await tasksController.addTask(data.task_title,data.task_description,data.task_type,decoded._id,
									data.tags,data.floor_price, data.ceiling_price, data.location, data.price_type);
								if(typeof result !== 'undefined'){
									socket.emit("sv-new-tasks",{"result" : result})
								}else{
									socket.emit("sv-new-tasks", {"result" : "undefined"});
								}
							}
						}else if(data.price_type == 'dealing'){
							var result = await tasksController.addTask(data.task_title,data.task_description,data.task_type,decoded._id,
								data.tags,null, null, data.location, data.price_type);
							if(typeof result !== 'undefined'){
								socket.emit("sv-new-tasks",{"result" : result})
							}else{
								socket.emit("sv-new-tasks", {"result" : "undefined"});
							}
						}else{
							socket.emit("sv-new-tasks", {"result" : "undefined"});
						}
					}else{
						socket.emit("sv-new-tasks",{"result":"miss-price-type"})
					}
				}
			});
		} catch (e) {
			socket.emit("sv-new-tasks",{"result" : "error"});
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





  