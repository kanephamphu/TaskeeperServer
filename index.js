var express = require("express");
var app = express();
var server= require("http").createServer(app);
var io=require("socket.io").listen(server);
const rateLimit = require("express-rate-limit");
var bodyparser = require('body-parser');
var userController = require('./controllers/UsersController');
var jwt= require('jsonwebtoken');
var checker = require('./controllers/Check');
const helmet = require('helmet')
var tasksController = require('./controllers/TaskController');
const niv = require('node-input-validator');
server.listen(process.env.PORT || 3000);
require('dotenv').config()

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 200 // limit each IP to 100 requests per windowMs
  });
app.use(bodyparser.json());
app.use(limiter);
app.use(helmet())
app.use(express.json({ limit: '300kb' })); // body-parser defaults to a body size limit of 300kb

io.sockets.on('connection',function(socket){
	socket.token='';
	console.log(socket.id+" is connecting");
	//Login server listener, if the account status is unActive send result unActive to client
	socket.on("cl-send-login-req", async function(data){
		try{
			const v= new niv.Validator(data,{
				loginquery : 'required|email',
				password : 'required|minLength:8'
			});
			const matched = await v.check();
			if(matched){
				const result = await userController.checkLogin(data.loginquery,data.password);
				if(result =='success'){
					const ID = await userController.getUserID(data.loginquery);
					const INFORMATION = await userController.getInformation(ID);
					const tokenInformation = {
						"_id" : ID,
						"username" : INFORMATION.login_information.username,
						"email" : INFORMATION.email.current_email,
						"phone_number" : INFORMATION.phone_number.current_phone_number,
						"first_name" : INFORMATION.first_name,
						"last_name" : INFORMATION.last_name
					};
					jwt.sign(tokenInformation,process.env.login_secret_key, { expiresIn: 60*60*24 },(err,token)=>{
							if(err){
								console.log(err);
							}
							socket.auth = true;
							console.log(token);
							var loginresult = {
								"success" : true,
								"secret_key" : token
							}
							socket.emit("sv-send-login-res",loginresult);
					});
				}else{
					var loginresult = {
						"success" : false,
						"errors" : {
							result 
						}
					}
					socket.emit("sv-send-login-res",loginresult);
				}
			}else{

				console.log(v.errors);
				let loginresult = {
					"success" : false,
					"errors": v.errors
				};
				console.log(loginresult);
				socket.emit("sv-send-login-res",loginresult);
			}
			
		}catch(e){
			socket.emit("sv-send-login-res",{"success" : false, "errors" : {"message" : "undefined"}});
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
			const v= new niv.Validator(data,{
				first_name : 'required|maxLength:50|regex:[a-z]',
				last_name : 'required|maxLength:50|regex:[a-z]',
				password : 'required|minLength:8',
				email : 'required|email',
				phone_number : 'required|phoneNumber'
			});
			const matched = await v.check();
			if(matched){
				var result = await userController.register(data.first_name,data.last_name,data.email,data.phone_number,data.password);
				console.log(result);
				socket.emit("sv-send-register-res",result);
			}else{
				socket.emit("sv-send-register-res",{"success" : false, "errors" : v.errors});
			}
			
		}catch(e){
			socket.emit("sv-send-register-res",{"success" : false, "errors" :{
				"message" : "undefined"
			}});
			console.log(e);
			throw(e);
		}
	});


	//Change password
	socket.on("cl-change-password",(data)=>{
		try{
			jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
				if(err) 
					socket.emit("sv-change-password",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
				if(decoded)
				{
					const v= new niv.Validator(data,{
						old_password : 'required|minLength:8',
						new_password : 'required|minLength:8|same:confirm_password',
						confirm_password : 'required|minLength:8'
					});
					const matched = await v.check();
					if(matched){
						if( checker.encrypt(data.old_password) == decoded.password){
							var changepassword = await userController.changePassword(decoded._id,data.new_password);
							if(typeof changepassword !== undefined){
								socket.emit("sv-change-password", changepassword);
							}else{
								socket.emit("sv-change-password", {"success" : false, "errors" : {"message" : "Server errors"}});
							}
						}else{
							socket.emit("sv-change-password",{"success" : false, "errors": {"message": "Wrong password", "rule": "old_password" }});
						}
					}else{
						socket.emit("sv-change-password", {"success" : false, "errors" : v.errors} );
					}
				}
			})
		}catch(e){
			socket.emit("sv-change-password", {"success" : false, "errors" : {"message" : "Server errors"}});
			throw(e);
		}
	})

	//Add new tasks
	socket.on("cl-new-tasks",async (data)=>{
		try {
			console.log(data);
			//Validate input of users
			const v= new niv.Validator(data,{
				secret_key : 'required',
				task_title : 'required',
				task_description : 'required',
				task_type : 'required',
				price_type : 'required',
				
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					//If token error, cancel transaction
					console.log(data);
					if(err){
						console.log(err);
						socket.emit("sv-new-tasks",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						console.log(data)
						//Check price_type, if it difference with undefined format, continue handle transaction 
						if(typeof data.price_type !== 'undefined'){
							if(data.price_type == 'unextract'){
								const v= new niv.Validator(data,{
									floor_price : 'required',
									ceiling_price : 'required'
								});
								const matched = await v.check();
								if(matched){
									if(data.floor_price >= data.ceiling_price){
										socket.emit("sv-new-tasks", {"success" : false, "errors" : {"message": "Ceiling price must greater than floor price"}})
									}else{
										var result = await tasksController.addFreelanceTask(data.task_title,data.task_description,data.task_type,decoded._id,
											data.tags,data.floor_price, data.ceiling_price, data.location, data.price_type);
										if(typeof result !== 'undefined'){
											socket.emit("sv-new-tasks",{"success" : true});
										}else{
											socket.emit("sv-new-tasks", {"success" : false, "errors" : {"message" : "Undefined errors"}});
										}
									}
								}
							//Handle the dealing price type 
							}else if(data.price_type == 'dealing'){
								var result = await tasksController.addTask(data.task_title,data.task_description,data.task_type,decoded._id,
									data.tags,null, null, data.location, data.price_type);
								if(typeof result !== 'undefined'){
									socket.emit("sv-new-tasks",{"success" : true});
								}else{
									socket.emit("sv-new-tasks", {"success" : false, "errors" : {"message" : "Undefined errors"}});
								}
							}else{
								socket.emit("sv-new-tasks", {"result" : "undefined"});
							}
						}else{
							socket.emit("sv-new-tasks",{"success":false, "errors": {"message" : "Miss price data type", "rule": "price_type"}})
						}
					}else{
						socket.emit("sv-new-tasks", {"success": false, "errors": v.errors})
					}
						
				});
			}
			console.log(data.secret_key);
			
		} catch (e) {
			socket.emit("sv-new-tasks",{"success" : false, "errors" : {"message" : "Undefined error"}});
			throw(e);	
		}
	});
	//Add New Working Information
	socket.on("cl-new-working",async (data)=>{
		try{
			const v= new niv.Validator(data,{
				secret_key : 'required',
				specialize : 'required',
				level : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-new-working",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						let result = await userController.addNewWorkingInformation(decoded._id,data.specialize,data.level);
						socket.emit("sv-new-working",result);
					}
				})
			}else{
				socket.emit("sv-new-working",{"success" : false, "errors" : v.errors});
			}
			
		}catch(e){
			socket.emit("sv-new-tasks",{"success" : false, "errors" : {"message" : "Undefined error"}});
			throw(e);
		}
	});
	//Edit The Working Information 
	socket.on("cl-edit-working",async (data)=>{
		try{
			const v = new niv.Validator(data,{
				secret_key : 'required',
				working_id : 'required',
				specialize : 'required',
				level : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key, async(err,decoded)=>{
					if(err){
						socket.emit("sv-edit-working",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						
					}
				})
			}else{
				socket.emit("sv-edit-working",{"success" : false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-edit-working",{"success" : false, "errors" : {"message" : "Undefined error"}})
			throw(e);
		}
	})
	//Add New Education Information
	socket.on("cl-new-edu",async (data)=>{
		try{
			const v= new niv.Validator(data,{
				secret_key : 'required',
				education_name : 'required',
				education_description : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-new-edu",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						let result = await userController.addNewEducationInformation(decoded._id,data.education_name,data.education_description);
						socket.emit("sv-new-edu",result);
					}
				})
			}else{
				socket.emit("sv-new-edu",{"success" : false, "errors" : v.errors});
			}
			
		}catch(e){
			socket.emit("sv-new-edu",{"success" : false, "errors" : {"message" : "Undefined error"}});
			throw(e);
		}
	});

	//Check validate test
	socket.on("test",async (data)=>{
		console.log(data);
		const v=new Validator(data,
			{
				first_name : 'required',
				last_name : 'required'
			});
		const matched = await v.check();
		if(!matched){
			console.log(v.errors);
			socket.emit("sv-test",v.errors);
		}else{
			socket.emit("sv-test",data);
		}
		
	});

	//View Task History List
	socket.on("cl-job-history", async(data)=>{
		/* Args: 
			_employee_id: is employee which id you want to look the job history
			skip: skip number of data list  
		*/
		try{
			const v= new niv.Validator(data, {
				"_employee_id" : required,
				"skip": skip
			});
			const matched = await v.check();
			if(!matched){
				socket.emit("sv-job-history",{"success" : false, "errors" : v.errors});
			}else{
				let list = await tasksController.viewTaskHistoryList(data._employee_id, data.skip);
				socket.emit("sv-job-history",{"success": true, "data": list});
			}
		}catch(e){
			socket.emit("sv-job-history",{"success" : false, "errors" : {"message" : "Undefined error"}});
			throw(e);
		}
	});

	//View Task Detail 
	socket.on("cl-task-detail", async(data)=>{
		/* Args: 
			task_id: is task which id you want to see detail
		*/
		try{
			const v= new niv.Validator(data,{
				"_task_id": required
			});
			const matched = await v.check();
			if(!matched){
				socket.emit("sv-task-detail", {"success": true, "errors" : v.errors})
			}else{
				let detail = await tasksController.viewTaskDetail(data._task_id);
				socket.emit("sv-task-detail", {"success": false, "data": detail});
			}
		}catch(e){
			socket.emit("sv-task-detail",{"success" : false, "errors" : {"message" : "Undefined error"}});
			throw(e);
		}
	});
	
	//Get all user infromation  detail
	socket.on("cl-user-detail", async(data)=>{
		/* 	Args:
				_id: user id
			Returns:
				All information of user. For instance, first_name, last_name, phone_number ...
		*/
		try{
			const v= niv.Validator(data, {
				"_user_id" : required
			});
			const matched = await v.check();
			if(!matched){
				socket.emit("sv-user-detail", {"success" : false, "errors" : v.errors});
			}else{
				let userDetail = await userController.getAllDetail(data._user_id);
				socket.emit("sv-user-detail", {"success" : true, "data" : userDetail});
			}
		}catch(e){
			socket.emit("sv-user-detail", {"success" : false, "errors" : {"message" : "Undefined error"}})
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






  