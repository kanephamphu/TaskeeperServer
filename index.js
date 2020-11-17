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
var searchqueryController = require('./controllers/SearchQueryController');
const niv = require('node-input-validator');
const { match } = require("assert");
const upload = require("express-fileupload")
const searchController = require('./controllers/SearchController');
const newsController = require('./controllers/NewsController');
const messageController = require('./controllers/MessageController');
const wallController = require('./controllers/WallController');
const { SSL_OP_COOKIE_EXCHANGE } = require("constants");
const notificationController = require("./controllers/NotificationController");
const notification = require("./models/NotificationModel");
const message = require("./models/MessageModel");
const moneytransactionController = require("./controllers/MoneyTransactionController");
var paypal = require('paypal-rest-sdk');
const { json } = require("body-parser");
const moneytransaction = require("./models/MoneyTransactionModel");
const industriesController = require("./controllers/IndustriesController");
const tagsController = require("./controllers/TagsController");
const skillsController = require("./controllers/SkillsController");
const skills = require("./models/SkillsModel");
const mediaController = require("./controllers/MediaController");
const media = require("./models/MediaModel");
const user = require("./models/UsersModel");
server.listen(process.env.PORT || 3000);
require('dotenv').config()

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 200 // limit each IP to 200 requests per windowMs
  });
paypal.configure({
'mode': 'sandbox', //sandbox or live
'client_id': 'Afvagy3K8uNO8fYSClGwAHAFappphFHDj6lVF8oGXPmdLKaCEznJ1aqo-mxViqTaOlLBQSbrwDfi6DnI',
'client_secret': 'EIiD5OOwLKPMNsnJrn4TXSgfAKo0-13JyjK5HjOr0Kpn0iCVhp2y7LBI7Od-qo6krrEI4-AOz9wC15qi'
});
app.use(bodyparser.json());
app.use(limiter);
app.use(helmet());
//setting middleware
app.use(express.static('./public'));
app.use(upload());
app.use(express.json({ limit: '300kb' })); // body-parser defaults to a body size limit of 300kb
var clients = [];
io.sockets.on('connection',function(socket){
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
						"avatar" : INFORMATION.avatar,
						"first_name" : INFORMATION.first_name,
						"last_name" : INFORMATION.last_name
					};
					//, { expiresIn: 60*60*24 }
					jwt.sign(tokenInformation,process.env.login_secret_key,(err,token)=>{
							if(err){
								console.log(err);
							}
							var loginresult = {
								"success" : true,
								"secret_key" : token
							}
							addToList(ID, socket.id);
							console.log(clients);
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
					if(await checkExist(decoded._id) == false){
						addToList(decoded._id, socket.id);
					}
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
					if(err){
						socket.emit("sv-new-tasks",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						//Check price_type, if it difference with undefined format, continue handle transaction 
						if(typeof data.price_type !== 'undefined'){
							if(data.price_type == 'unextract'){
								const p= new niv.Validator(data,{
									floor_price : 'required|integer',
									ceiling_price : 'required|integer'
								});
								const matched1 = await p.check();
								if(matched1){
									if(data.floor_price >= data.ceiling_price){
										socket.emit("sv-new-tasks", {"success" : false, "errors" : {"message": "Ceiling price must greater than floor price"}})
									}else{
										var result = await tasksController.addTask(data.task_title, data.task_description, data.task_requirement, decoded.first_name, decoded.last_name, decoded.avatar,
											data.task_type, decoded._id, data.tags, data.floor_price, data.ceiling_price, data.location, data.price_type, data.language, data.industry, data.skills, data.day, data.month, data.year);
										if(typeof result !== 'undefined'){
											console.log(result);
											socket.emit("sv-new-tasks",result);
											// Add tasks to news feed of followers, and add to wall
											if(result.success = true){
												newsController.addNewsToFollowers(decoded._id, result.data._id);
												wallController.addWall(decoded._id, result.data._id);
											}
										}else{
											socket.emit("sv-new-tasks", {"success" : false, "errors" : {"message" : "Undefined errors"}});
										}
									}
								}else{
									socket.emit("sv-new-tasks", {"success": false, "errors": p.errors})
								}
							//Handle the dealing price type 
							}else if(data.price_type == 'dealing'){
								var result = await tasksController.addTask(data.task_title,data.task_description, data.task_requirement, decoded.first_name,decoded.last_name,decoded.avatar,data.task_type,decoded._id,
									data.tags,null, null, data.location, data.price_type, data.language, data.industry, data.skills);
								if(typeof result !== 'undefined'){
									socket.emit("sv-new-tasks",result);
									// Add tasks to news feed of followers
									if(result.success = true){
										newsController.addNewsToFollowers(decoded._id, result.data._id);
										wallController.addWall(decoded._id, result.data._id);
									}
								}else{
									socket.emit("sv-new-tasks", {"success" : false, "errors" : {"message" : "Undefined errors"}});
								}
							}else{
								socket.emit("sv-new-tasks", {"result" : "undefined"});
							}
						}else{
							socket.emit("sv-new-tasks",{"success":false, "errors": {"message" : "Miss price data type", "rule": "price_type"}})
						}
					}
						
				});
			}else{
				socket.emit("sv-new-tasks", {"success": false, "errors": v.errors})
			}
			
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
				company_name : 'required',
				position : 'required',
				time_type : 'required',
				from_time : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-new-working",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						if(data.time_type=="past"){
							const v1= new niv.Validator(data,{
								to_time : "required"
							});
							const matched1 = await v1.check();
							if(!matched1){
								socket.emit("sv-new-working",{"success" : false, "errors" : v1.errors});
							}else{
								let result = await userController.addNewWorkingInformation(decoded._id,data.company_name, data.position, data.description, data.time_type, data.from_time, data.to_time);
								socket.emit("sv-new-working",result);
							}
						}else{
							let result = await userController.addNewWorkingInformation(decoded._id,data.company_name, data.position, data.description, data.time_type, data.from_time, null);
							socket.emit("sv-new-working",result);
						}
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
				work_id : 'required',
				company_name : 'required',
				position : 'required',
				time_type : 'required',
				from_time : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key, async(err,decoded)=>{
					if(err){
						socket.emit("sv-edit-working",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						if(data.time_type=="past"){
							const v1= new niv.Validator(data,{
								to_time : "required"
							});
							const matched1 = await v1.check();
							if(!matched1){
								socket.emit("sv-edit-working",{"success" : false, "errors" : v1.errors});
							}else{
								let result = await userController.editWorkingInformation(decoded._id,data.work_id, company_name, data.position, data.description, data.time_type, data.from_time, data.to_time);
								socket.emit("sv-edit-working",result);
							}
						}else{
							let result = await userController.editWorkingInformation(decoded._id, data.work_id, data.company_name, data.position, data.description, data.time_type, data.from_time, null);
							socket.emit("sv-edit-working",result);
						}
					}
				})
			}else{
				socket.emit("sv-edit-working",{"success" : false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-edit-working",{"success" : false, "errors" : {"message" : "Undefined error"}})
			throw(e);
		}
	});

	//Delete The Wokring Infomation
	socket.on("cl-delete-working", async(data)=>{
		/*
		Args:
			secret_key: Jwt token key
			working_id:  Working of ID 
		*/
		try{
			const v= new niv.Validator(data,{
				secret_key : 'required',
				work_id : 'required' 
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-delete-working",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await userController.deleteWorkingInformation(decoded._id,data.work_id);
						socket.emit("sv-delete-working",result);
					}
				})
			}else{
				socket.emit("sv-delete-working",{"success" : false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-delete-working",{"success" : false, "errors" : {"message" : "Undefined error"}});
			throw(e);
		}
	});

	//Add New Education Information
	socket.on("cl-new-edu",async (data)=>{
		try{
			const v= new niv.Validator(data,{
				secret_key : 'required',
				school_name : 'required',
				description : 'required',
				time_type : 'required',
				from_time : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-new-edu",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						if(data.time_type=='past'){
							const v1= new niv.Validator(data,{
								to_time : "required"
							});
							const matched1 = await v1.check();
							if(!matched1){
								socket.emit("sv-new-edu",{"success" : false, "errors" : v1.errors});
							}else{
								let result = await userController.addNewEducationInformation(decoded._id, data.school_name, data.description, data.time_type, data.from_time, data.to_time);
								socket.emit("sv-new-edu",result);
							}
						}else{
							let result = await userController.addNewEducationInformation(decoded._id, data.school_name, data.description, data.time_type, data.from_time, null);
							socket.emit("sv-new-edu",result);
						}
					}
				})
			}else{
				socket.emit("sv-new-edu",{"success" : false, "errors" : v.errors});
			}
			
		}catch(e){
			socket.emit("sv-new-edu",{"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});
	//Edit education information 
	socket.on("cl-edit-edu", async(data)=>{
		/*
		Args: 
			secret_key : Secret is sent by user. 
			education_id : Id of education information
			education_name : Name of course or school
			education_description: description of education
		Returns: 
			Result of socket 
		*/
		try{
			const v= new niv.Validator(data, {
				secret_key : 'required',
				edu_id : 'required',
				school_name : 'required',
				description : 'required',
				time_type : 'required',
				from_time : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-edit-edu",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						if(data.time_type=="past"){
							const v1= new niv.Validator(data,{
								to_time : "required"
							});
							const matched1 = await v1.check();
							if(!matched1){
								socket.emit("sv-edit-edu",{"success" : false, "errors" : v1.errors});
							}else{
								let result = await userController.editEducationInformation(decoded._id, data.edu_id, data.school_name, data.description, data.time_type, data.from_time, data.to_time);
								socket.emit("sv-edit-edu",result);
							}
						}else{
							let result = await userController.editEducationInformation(decoded._id, data.edu_id, data.school_name, data.description, data.time_type, data.from_time, null);
							socket.emit("sv-edit-edu",result);
						}
					}
				})
			}else{
				socket.emit("sv-edit-edu",{"success" : false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-edit-edu", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}

	});	

	//Delete The Education Infomation
	socket.on("cl-delete-edu", async(data)=>{
		/*
		Args:
			secret_key: Jwt token key
			education_id:  Working of ID 
		*/
		try{
			const v= new niv.Validator(data,{
				secret_key : 'required',
				education_id : 'required' 
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-delete-edu",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await userController.deleteEducationInformation(decoded._id,data.education_id);
						socket.emit("sv-delete-edu",result);
					}
				})
			}else{
				socket.emit("sv-delete-edu",{"success" : false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-delete-edu",{"success" : false, "errors" : {"message" : "Undefined error"}});
			throw(e);
		}
	});

	//View User Task History List
	socket.on("cl-job-history", async(data)=>{
		/* Args: 
			_user_id: is employee which id you want to look the job history
			skip: skip number of data list  
		*/
		try{
			const v= new niv.Validator(data, {
				_user_id : 'required',
				skip : 'required'
			});
			const matched = await v.check();
			if(!matched){
				socket.emit("sv-job-history",{"success" : false, "errors" : v.errors});
			}else{
				let list = await tasksController.viewTaskHistoryList(data._user_id, data.skip);
				socket.emit("sv-job-history",{"success": true, "data": list});
			}
		}catch(e){
			socket.emit("sv-job-history",{"success" : false, "errors" : {"message" : "Undefined error"}});
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
			const v= new niv.Validator(data, {
				_user_id : 'required'
			});
			const matched = await v.check();
			if(!matched){
				socket.emit("sv-user-detail", {"success" : false, "errors" : v.errors});
			}else{
				let userDetail = await userController.getAllDetail(data._user_id);
				socket.emit("sv-user-detail", {"success" : true, "data" : userDetail});
			}
		}catch(e){
			console.log(e);
			socket.emit("sv-user-detail", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});

	//Get all user infromation  detail
	socket.on("cl-working-info-detail", async(data)=>{
		/* 	Args:
				_id: user id
			Returns:
				All information of user. For instance, first_name, last_name, phone_number ...
		*/
		try{
			const v= new niv.Validator(data, {
				_user_id : 'required'
			});
			const matched = await v.check();
			if(!matched){
				socket.emit("sv-working-info-detail", {"success" : false, "errors" : v.errors});
			}else{
				let workingInfo = await userController.getWorkingInfo(data._user_id);
				socket.emit("sv-working-info-detail", workingInfo);
			}
		}catch(e){
			console.log(e);
			socket.emit("sv-working-info-detail", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});

	//Get all user infromation  detail
	socket.on("cl-edu-info-detail", async(data)=>{
		/* 	Args:
				_id: user id
			Returns:
				All information of user. For instance, first_name, last_name, phone_number ...
		*/
		try{
			const v= new niv.Validator(data, {
				_user_id : 'required'
			});
			const matched = await v.check();
			if(!matched){
				socket.emit("sv-edu-info-detail", {"success" : false, "errors" : v.errors});
			}else{
				let eduInfo = await userController.getEduInfo(data._user_id);
				console.log(eduInfo)
				socket.emit("sv-edu-info-detail", eduInfo);
			}
		}catch(e){
			console.log(e);
			socket.emit("sv-edu-info-detail", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});

	//View Task Detail 
	socket.on("cl-task-detail", async(data)=>{
		/* Args: 
			task_id: is task which id you want to see detail
		*/
		try{
			const v= new niv.Validator(data,{
				_task_id : 'required'
			});
			const matched = await v.check();
			if(!matched){
				socket.emit("sv-task-detail", {"success": false, "errors" : v.errors})
			}else{
				let detail = await tasksController.viewTaskDetail(data._task_id);
				socket.emit("sv-task-detail", {"success": true, "data": detail});
			}
		}catch(e){
			socket.emit("sv-task-detail",{"success" : false, "errors" : {"message" : "Undefined error"}});
			throw(e);
		}
	});

	// Employee apply to job
	socket.on("cl-apply-job", async(data)=>{
		/* 
		Args:
			secret_key: Json web token cotains user id
			task_id:  task id of job to join
			introduction: give some information about you
			floor_price: 
			ceiling_price:
		*/
		try{
			const v = new niv.Validator(data,{
				secret_key : 'required',
				task_id : 'required',
				introduction : 'required',
				price : 'required' 
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-apply-job",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await tasksController.addApplicationJob(decoded._id,data.task_id,data.introduction,data.price);
						socket.emit("sv-apply-job",result);
						let task_owner_id = await tasksController.getTaskOwnerId(data.task_id);
						notificationController.addNotification(task_owner_id, "applied you to work", "applied", data.task_id, decoded._id);
						if(checkExist(data.user_id)){
							let socketUserId = await getSocketID(task_owner_id);
							io.to(socketUserId).emit("sv-send-notification", {"success" : true, data : {"type" : "applied", "user_id" : decoded._id, "task_id" : data.task_id}});
						}
					}
				});
			}else{
				socket.emit("sv-apply-job",{"success" : false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-apply-job",{"success" : false, "errors" : {"message" : "Undefined error"}});
			throw(e);
		}
	});

	// Employee delete job application
	socket.on("cl-delete-apply-job", async(data)=>{
		/*
		Args:
			secret_key : Json web token
			task_id : Task id which you want to delete job application
		*/
		try{
			const v=new niv.Validator(data,{
				secret_key : 'required',
				task_id : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-delete-apply-job",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await tasksController.deleteApplicationJob(decoded._id, data.task_id);
						socket.emit("sv-delete-apply-job",result);
					}
				});
			}else{
				socket.emit("sv-delete-apply-job", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-delete-apply-job", {"success" : false, "errors" : {"message" : "Undefined error"}});
			throw(e);
		}
	});

	// Update job application
	socket.on("cl-update-apply-job", async(data)=>{
		/* 
		Args:
			secret_key: Json web token cotains user id
			task_id:  task id of job to join
			introduction: give some information about you
			floor_price: 
			ceiling_price:
		*/
		try{
			const v = new niv.Validator(data,{
				secret_key : 'required',
				task_id : 'required',
				introduction : 'required',
				floor_price : 'required',
				ceiling_price : 'required' 
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-update-apply-job",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await tasksController.updateApplicationJob(decoded._id,data._task_id,data.introduction,data.floor_price,data.ceiling_price);
						socket.emit("sv-update-apply-job",result);
					}
				});
			}else{
				socket.emit("sv-update-apply-job",{"success" : false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-update-apply-job", {"success" : false, "errors" : {"message" : "Undefined error"}});
			throw(e);
		}
	});

	// Client following another user
	socket.on("cl-follow-user", async(data)=>{
		/*
		Args:
			secret_key: Json web token,
			user_id: ID of user is followed
		*/
		try{
			const v = new niv.Validator(data,{
				secret_key : 'required',
				user_id : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-follow-user",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await userController.addFollower(data.user_id, decoded._id);
						socket.emit("sv-follow-user",result);
						notificationController.addNotification(data.user_id, "followed you", "followed", decoded._id, null);
						if(checkExist(data.user_id)){
							let socketUserId = await getSocketID(data.user_id);
							io.to(socketUserId).emit("sv-send-notification", {"success" : true, data : {"type" : "followed", "follower_id" : data.user_id}});
						}	
					}
				});
			}else{
				socket.emit("sv-follow-user",{"success" : false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-follow-user", {"success" : false, "errors" : {"message" : "Undefined error"}});
			throw(e);
		}
	});
	
	//WARNING: Get list tasks, for testing 
	socket.on("cl-get-default-tasks",async(data)=>{
		/*Args:
			number_task: It is count number of tasks
			skip : Skip number  
		*/
		try{
			const v=new niv.Validator(data,{
				number_task : 'required',
				skip : 'required'
			});

			const matched = await v.check();
			if(!matched){
				socket.emit("sv-get-default-tasks", {"success": false, "errors" : v.errors})
			}else{
				let listTasks = await tasksController.getTasks(data.number_task,data.skip);
				socket.emit("sv-get-default-tasks",{"success" : true, "data" : listTasks});
			}
		}catch(e){
			socket.emit("sv-get-default-tasks", {"success" : false, "errors" : {"message" : "Undefined error"}});
			throw(e);
		}
	});

	// Search auto complete 
	socket.on("cl-search-autocomplete", async(data)=>{
		/*
		Args:
			search_string : search string for predict
		Returns:
			socket.on auto complete search string
		*/
		try{
			const v=new niv.Validator(data, {
				search_string : 'required'
			});
			const matched = await v.check();
			if(matched){
				let result = await searchqueryController.searchAutoComplete(data.search_string);
				socket.emit("sv-search-autocomplete", {"success" : true, "data" : result});
			}else{
				socket.emit("sv-search-autocomplete", {"success": false, "errors" : v.errors})
			}
		}catch(e){
			socket.emit("sv-search-autocomplete", {"success" : false, "errors" : {"message" : "Undefined error"}});
			throw(e);
		}
	});

	//Client send search user 
	socket.on("cl-search-user", async(data)=>{
		/*
		Args: 
			search_string : Search string for looking 
		Returns: 
			socket.on search result 
		*/
		try{
			const v=new niv.Validator(data, {
				search_string : 'required'
			});
			const matched = await v.check();
			if(matched){
				let result = await searchController.searchUser(data.search_string);
				socket.emit("sv-search-user", {"success" : true, "data" : result});
				searchqueryController.addSearchQuery(data.search_string);
				if(data.secret_key){
					jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
						if(decoded){
							userController.addSearchHistory(decoded._id, data.search_string);
						}
					});
				}
			}else{
				socket.emit("sv-search-user", {"success": false, "errors" : v.errors})

			}
		}catch(e){
			socket.emit("sv-search-user", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});

	//Client send search task 
	socket.on("cl-search-task", async(data)=>{
		/*
		Args: 
			search_string : Search string for looking 
		Returns: 
			socket.on search result 
		*/
		try{
			const v=new niv.Validator(data, {
				search_string : 'required'
			});
			const matched = await v.check();
			if(matched){
				let result = await searchController.searchTask(data.search_string);
				socket.emit("sv-search-task", {"success" : true, "data" : result});
				searchqueryController.addSearchQuery(data.search_string);
				if(data.secret_key){
					jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
						if(decoded){
							userController.addSearchHistory(decoded._id, data.search_string);
							searchqueryController.addSearchQuery(data.search_string);
						}
					});
				}
			}else{
				socket.emit("sv-search-task", {"success": false, "errors" : v.errors})
			}
		}catch(e){
			socket.emit("sv-search-task", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});

	// User edit information 
	socket.on("cl-edit-info",async(data)=>{
		/*
		Args: 

		*/
		try{
			const v=new niv.Validator(data, {
				secret_key : 'required',
				first_name : 'required',
				last_name : 'required',
				email : 'required|email',
				phone_number : 'required|phoneNumber',
				gender : 'required',
				day_of_birth : 'required|integer',
				month_of_birth : 'required|integer',
				year_of_birth : 'required|integer'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-edit-info",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await userController.editPersonalInfo(decoded._id,data.first_name, data.last_name, data.email,data.phone_number, data.gender, data.day_of_birth, data.month_of_birth, data.year_of_birth);
						socket.emit("sv-edit-info", result);
					}
				})
			}else{
				socket.emit("sv-edit-info", {"success": false, "errors" : v.errors})
			}
		}catch(e){
			socket.emit("sv-edit-info", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});

	// Add new message, client send message
	socket.on("cl-send-message", async(data)=>{
		try{
			const v=new niv.Validator(data, {
				secret_key : 'required',
				receiver_id : 'required',
				text : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-send-message",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await messageController.addMessage(decoded._id,data.receiver_id, data.text, null, null, null);
						socket.emit("sv-send-message", result);
						if(checkExist(data.receiver_id)){
							let socketUserId = await getSocketID(data.user_id);
							let newestMessage = await messageController.getNewestMessage(decoded._id,data.receiver_id);
							io.to(socketUserId).emit("sv-get-private-message", {"success" : true, data : newestMessage});
						}	
					}
				})
			}else{
				socket.emit("sv-send-message", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-send-message", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});

	// Client set readed mesages
	socket.on("cl-set-readed-message", async(data)=>{
		try{
			const v=new niv.Validator(data, {
				secret_key : 'required',
				sender_id : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-set-readed-message",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await messageController.setReaded(decoded._id, data.sender_id);
						socket.emit("sv-set-readed-message", result);
					}
				})
			}else{
				socket.emit("sv-set-readed-message", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-set-readed-message", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});

	// Client set readed mesages
	socket.on("cl-set-readed-all-message", async(data)=>{
		try{
			const v=new niv.Validator(data, {
				secret_key : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-set-readed-all-message",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await messageController.setAllReaded(decoded._id);
						socket.emit("sv-set-readed-all-message", result);
					}
				})
			}else{
				socket.emit("sv-set-readed-all-message", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-set-readed-all-message", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});
	// Get list recommend 
	socket.on("cl-get-recommend-task", async(data)=>{
		try{
			const v=new niv.Validator(data, {
				secret_key : 'required',
				skip : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-get-recommend-task",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						socket.emit("sv-get-recommend-task", {"success" : true, "data" : [{
							"_id" : "5f1c581dcde7010774853652",
							"task_owner_first_name" : "FPT",
							"task_owner_last_name" : "Software",
							"location" : "Da Nang",
							"task_title" : "Tuyển nhân sự",
							"task_owner_avatar" : "https://live.staticflickr.com/3689/8989851909_9b78222fbb.jpg"
						},
						{
							"_id" : "5f1c581dcde7010774853652",
							"task_owner_first_name" : "FPT",
							"task_owner_last_name" : "Software",
							"location" : "Da Nang",
							"task_title" : "Tuyển nhân sự",
							"task_owner_avatar" : "https://live.staticflickr.com/3689/8989851909_9b78222fbb.jpg"
						},
						{
							"_id" : "5f1c581dcde7010774853652",
							"task_owner_first_name" : "FPT",
							"task_owner_last_name" : "Software",
							"location" : "Da Nang",
							"task_title" : "Tuyển nhân sự",
							"task_owner_avatar" : "https://live.staticflickr.com/3689/8989851909_9b78222fbb.jpg"
						},
						{
							"_id" : "5f1c581dcde7010774853652",
							"task_owner_first_name" : "FPT",
							"task_owner_last_name" : "Software",
							"location" : "Da Nang",
							"task_title" : "Tuyển nhân sự",
							"task_owner_avatar" : "https://live.staticflickr.com/3689/8989851909_9b78222fbb.jpg"
						},
						{
							"_id" : "5f1c581dcde7010774853652",
							"task_owner_first_name" : "FPT",
							"task_owner_last_name" : "Software",
							"location" : "Da Nang",
							"task_title" : "Tuyển nhân sự",
							"task_owner_avatar" : "https://live.staticflickr.com/3689/8989851909_9b78222fbb.jpg"
						},
						{
							"_id" : "5f1c581dcde7010774853652",
							"task_owner_first_name" : "FPT",
							"task_owner_last_name" : "Software",
							"location" : "Da Nang",
							"task_title" : "Tuyển nhân sự",
							"task_owner_avatar" : "https://live.staticflickr.com/3689/8989851909_9b78222fbb.jpg"
						}
					]});
					}
				})
			}else{
				socket.emit("sv-get-recommend-task", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-get-recommend-task", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});
	// Get follower list
	socket.on("cl-get-followers", async(data)=>{
		try {
			const v=new niv.Validator(data, {
				secret_key : 'required'
			});
			const matched = await v.check();
			if(matched){
				if(await checkExist(decoded._id) == false){
					addToList(decoded._id, socket.id);
				}
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-get-followers",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						let result = await userController.getFollowerList(decoded._id);
						socket.emit("sv-get-followers", result);
					}
				})
			}
		} catch (e) {
			socket.emit("sv-get-followers", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});

	// Get all of the candidate who apply to the job
	socket.on("cl-get-candidate-apply-job", async(data)=>{
		try {
			const v=new niv.Validator(data, {
				secret_key : 'required',
				task_id : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-get-candidate-apply-job",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await tasksController.getApplyList(data.task_id);
						socket.emit("sv-get-candidate-apply-job", result);
					}
				});
			}else{
				socket.emit("sv-get-candidate-apply-job", {"success": false, "errors" : v.errors})
			}
		} catch (e) {
			socket.emit("sv-get-candidate-apply-job", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});	

	// Get all job is applied
	socket.on("cl-get-applied-job", async(data)=>{
		try{
			const v=new niv.Validator(data, {
				secret_key : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-get-applied-job",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await tasksController.getAppliedJobs(decoded._id);
						socket.emit("sv-get-applied-job", result);
					}
				});
			}else{
				socket.emit("sv-get-applied-job", {"success": false, "errors" : v.errors})
			}
		}catch(e){
			socket.emit("sv-get-applied-job", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});
	
	// Get top search trend
	socket.on("cl-get-search-trend", async(data)=>{
		try{
			let result = await searchController.getSearchTrend();
			if(result)
				socket.emit("sv-get-search-trend", {"success" : true, "data" : result});
			else
				socket.emit("sv-get-search-trend", {"success" : false});
		}catch(e){
			socket.emit("sv-get-search-trend", {"success" : false, "errors" : {"message" : "Undefined error"}})
		}
	});

	// Get search history 
	socket.on("cl-get-search-history",async(data)=>{
		try{
			if(data.secret_key){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-get-search-history",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await userController.getSearchHistory(decoded._id);
						socket.emit("sv-get-search-history", result);
					}
				});
			}else{
				socket.emit("sv-get-search-history", {"success" : true, "data" : {}});
			}
		}catch(e){
			socket.emit("sv-get-search-history", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});
	
	// Get news feed 
	socket.on("cl-get-news-feed", async(data)=>{
		try{
			const v=new niv.Validator(data, {
				secret_key : 'required',
				number_task : 'required',
				skip : 'required'
			});
			const matched = await v.check();		
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-get-news-feed",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await newsController.getNewsData(decoded._id, data.number_task, data.skip);
						socket.emit("sv-get-news-feed", result);
					}
				});
			}else{
				socket.emit("sv-get-news-feed", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-get-news-feed", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});

	// Get profile wall task 
	socket.on("cl-get-wall-task", async(data)=>{
		try{
			const v=new niv.Validator(data, {
				user_id : 'required',
				number_task : 'required',
				skip : 'required'
			});
			const matched = await v.check();
			if(matched){
				let result = await wallController.getWallData(data.user_id, data.number_task, data.skip);
				socket.emit("sv-get-wall-task", result);
			}else{
				socket.emit("sv-get-news-feed", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-get-wall-task", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});
	
	// Client load message
	socket.on("cl-get-private-message", async(data)=>{
		try{
			const v= new niv.Validator(data, {
				secret_key : 'required',
				receiver_id : 'required',
				skip : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-get-private-message",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await messageController.readUserMessage(decoded._id, data.receiver_id, 10, data.skip);
						socket.emit("sv-get-private-message", result);
						//socket.emit("sv-get-private-message", result);
					}
				});
			}else{
				socket.emit("sv-get-private-message", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-get-private-message", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});
	
	// Client get messsager list
	socket.on("cl-get-message-list", async(data)=>{
		try{
			const v= new niv.Validator(data, {
				secret_key : 'required',
				skip : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-get-message-list",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await messageController.readMessage(decoded._id,100,data.skip);
						socket.emit("sv-get-message-list", result);
					}
				});
			}else{
				socket.emit("sv-get-message-list", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-get-message-list", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});
	
	// Client get notification
	socket.on("cl-get-notification", async(data)=>{
		try{
			const v= new niv.Validator(data, {
				secret_key : 'required',
				number_notification : 'required',
				skip : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-read-notification",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await notificationController.getNotification(decoded._id, data.number_notification, data.skip);
						socket.emit("sv-read-notification", result);
					}
				});
			}else{
				socket.emit("sv-read-notification", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-read-notification", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});
	
	// Client set notification is readed
	socket.on("cl-readed-notification", async(data)=>{
		try{
			const v= new niv.Validator(data, {
				secret_key : 'required',
				notifcation_id : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-readed-notification",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await notificationController.setReaded(decoded._id, data.notification_id);
						socket.emit("sv-readed-notification", result);
					}
				});
			}else{
				socket.emit("sv-readed-notification", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-readed-notification", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});
	
	// Client set all notification readed
	socket.on("cl-readed-all-notification", async(data)=>{
		try{
			const v= new niv.Validator(data, {
				secret_key : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-readed-all-notification",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await notificationController.setReadedAll(decoded._id);
						socket.emit("sv-readed-all-notification", result);
					}
				});
			}else{
				socket.emit("sv-readed-all-notification", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-readed-all-notification", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});
	
	// Client get total unread notification
	socket.on("cl-get-total-unread-notification", async(data)=>{
		try{
			const v= new niv.Validator(data, {
				secret_key : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-get-total-unread-notification",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await notificationController.getTotalUnreadNotification(decoded._id)
						socket.emit("sv-get-total-unread-notification", result);
					}
				});
			}else{
				socket.emit("sv-get-total-unread-notification", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-get-total-unread-notification", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});

	// Client save task
	socket.on("cl-save-task", async(data)=>{
		try{
			const v= new niv.Validator(data, {
				secret_key : 'required',
				task_id : 'required'
			});
			console.log(data)
			const matched = await v.check();
			console.log(matched)
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-save-task",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await userController.saveTask(decoded._id, data.task_id);
						socket.emit("sv-save-task", result);
					}
				});
			}else{
				socket.emit("sv-save-task", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-save-task", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});
	
	// Client get saved task
	socket.on("cl-get-saved-task", async(data)=>{
		try{
			const v= new niv.Validator(data, {
				secret_key : 'required',
				number_task : 'required',
				skip : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-get-saved-task",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await userController.getSavedTask(decoded._id,data.number_task, data.skip);
						socket.emit("sv-get-saved-task", result);
					}
				});
			}else{
				socket.emit("sv-get-saved-task", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-get-saved-task", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});

	// Client remove saved task
	socket.on("cl-remove-saved-task", async(data)=>{
		try{
			const v= new niv.Validator(data, {
				secret_key : 'required',
				task_saved_id : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-remove-saved-task",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await userController.deleteSavedTask(decoded._id, data.task_saved_id);
						socket.emit("sv-remove-saved-task", result);
					}
				});
			}else{
				socket.emit("sv-remove-saved-task", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-remove-saved-task", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});
	
	// Client send money transaction request
	socket.on("cl-money-transfer-request", async(data)=>{
		try{
			const v= new niv.Validator(data, {
				secret_key : 'required',
				receiver_id : 'required',
				money_amount : 'required',
				description : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-money-transfer-request",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await moneytransactionController.addMoneyTransaction(decoded._id, data.receiver_id, data.money_amount, data.description);
						socket.emit("sv-money-transfer-request", result);
					}
				});
			}else{
				socket.emit("sv-money-transfer-request", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-money-transfer-request", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});
	
	//Client get money transaction 
	socket.on("cl-get-money-transaction-history", async(data)=>{
		try{
			const v= new niv.Validator(data, {
				secret_key : 'required',
				skip : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-get-money-transaction-history",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await moneytransactionController.getTransactionData(decoded._id,20, data.skip);
						socket.emit("sv-get-money-transaction-history", result);
					}
				});
			}else{
				socket.emit("sv-get-money-transaction-history", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-get-money-transaction-history", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});
	// Client add fund
	socket.on("cl-add-fund", async(data)=>{
		try{
			const v= new niv.Validator(data, {
				secret_key : 'required',
				total : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-remove-saved-task",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						var create_payment_json = {
							"intent": "sale",
							"payer": {
								"payment_method": "paypal"
							},
							"redirect_urls": {
								"return_url": "https://taskeepererver.herokuapp.com/payment-success",
								"cancel_url": "https://taskeepererver.herokuapp.com/payment-failure"
							},
							"transactions": [{
								"item_list": {
									"items": [{
										"name": "Add fund to ",
										"sku": "item",
										"price": "1.00",
										"currency": "USD",
										"quantity": 1
									}]
								},
								"amount": {
									"currency": "USD",
									"total": data.total
								},
								"description": "This is the payment description."
							}]
						};
						paypal.payment.create(create_payment_json, function (error, payment) {
							if (error) {
								throw error;
							} else {
								socket.emit("sv-add-fund", {"success" : true, "data" : {"redirect_href" : payment.links[1].href}});
							}
						});
					}
				});
			}else{
				socket.emit("sv-add-fund", {"success" : false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-add-fund", {"success" : false, "errors" : {"message" : "Undefiend error"}});
		}
	}); 
	
	// Set task is done 
	socket.on("cl-set-task-done", async(data)=>{
		try{
			const v= new niv.Validator(data, {
				secret_key : 'required',
				task_id : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("cl-set-task-done",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await tasksController.setTaskDone(decoded._id, data.task_id);
						socket.emit("cl-set-task-done", result);
					}
				});
			}else{
				socket.emit("cl-set-task-done", {"success" : false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("cl-set-task-done", {"success" : false, "errors" : {"message" : "Undefiend error"}});
		}
	});
	
	// Client get list industry recommendation for post new job
	socket.on("cl-get-industry-list", async(data)=>{{
		try{
			const v= new niv.Validator(data, {
				language : 'required'
			});
			const matched = await v.check();
			if(matched){
				let result = await industriesController.getIndustries(data.language);
				socket.emit("sv-get-industry-list", result);
			}else{
				socket.emit("sv-get-industry-list", {"success" : false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-get-industry-list", {"success" : false, "errors" : {"message" : "Undefiend error"}});
		}
	}});

	// Client get list tags recommendation for post new job
	socket.on("cl-get-tags-list", async(data)=>{{
		try{
			const v= new niv.Validator(data, {
				tag_query : 'required'
			});
			const matched = await v.check();
			if(matched){
				let result = await tagsController.searchTags(data.tag_query);
				socket.emit("sv-get-tags-list", result);
			}else{
				socket.emit("sv-get-tags-list", {"success" : false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-get-tags-list", {"success" : false, "errors" : {"message" : "Undefiend error"}});
		}
	}});

	// Client get list skills recommendation for post new job
	socket.on("cl-get-skills-list", async(data)=>{{
		try{
			const v= new niv.Validator(data, {
				skill_query : 'required'
			});
			const matched = await v.check();
			if(matched){
				let result = await skillsController.searchSkills(data.skill_query);
				socket.emit("sv-get-skills-list", result);
			}else{
				socket.emit("sv-get-skills-list", {"success" : false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-get-skills-list", {"success" : false, "errors" : {"message" : "Undefiend error"}});
		}
	}});
	// Client send new location 
	socket.on("cl-send-new-location", async(data)=>{
		try{
			const v= new niv.Validator(data, {
				secret_key : 'required',
				lat : 'required',
				lng : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("cl-send-new-location",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await userController.addNewLocationInformation(decoded._id, data.lat, data.lng);
						socket.emit("cl-send-new-location", result);
					}
				});
			}else{
				socket.emit("cl-send-new-location", {"success" : false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("cl-send-new-location", {"success" : false, "errors" : {"message" : "Undefiend error"}});
		}
	});

	//Client send vote user 
	socket.on("cl-send-vote", async(data)=>{
		try{
			const v= new niv.Validator(data, {
				secret_key : 'required',
				user_id : 'required',
				vote_point : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-send-vote",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						if(await checkExist(decoded._id) == false){
							addToList(decoded._id, socket.id);
						}
						let result = await userController.voteUser(data.user_id, decoded._id, data.vote_point)
						socket.emit("sv-send-vote", result);
					}
				});
			}else{
				socket.emit("sv-send-vote", {"success" : false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-send-vote", {"success" : false, "errors" : {"message" : "Undefiend error"}});
		}
	});
	
	//Client send get verify email request
	socket.on("cl-send-verify-mail", async(data)=>{
		try{
			const v= new niv.Validator(data, {
				secret_key : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("cl-send-verify-mail",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						let result = await userController.sendVerifyAccountEMail(decoded._id)
						socket.emit("cl-send-verify-mail", result);
					}
				});
			}else{
				socket.emit("cl-send-verify-mail", {"success" : false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("cl-send-verify-mail", {"success" : false, "errors" : {"message" : "Undefiend error"}});
		}
	});
	
	//Verify by verify number
	socket.on("cl-send-verify-number", async(data)=>{
		try{
			const v= new niv.Validator(data, {
				secret_key : 'required',
				verify_number : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("cl-send-verify-number",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						let result = await userController.setActivateByVerifyNumber(decoded._id, data.verify_number);
						socket.emit("cl-send-verify-number", result);
					}
				});
			}else{
				socket.emit("cl-send-verify-number", {"success" : false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("cl-send-verify-number", {"success" : false, "errors" : {"message" : "Undefiend error"}});
		}
	});
	//Disconnect
	socket.on('disconnect', function () {
		removeFromList(socket.id);
		console.log(socket.id+" disconnected");
	});
	/*
	// Client set readed message
	socket.on("cl-set-readed-message", async(data)=>{
		try{
			const v= new niv.Validator(data, {
				secret_key : 'required',
				receiver_id : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-set-readed-message",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						let result = await messageController.setReaded(data.receiver_id, decoded._id);
						socket.emit("sv-set-readed-message", result);
					}
				});
			}else{
				socket.emit("sv-set-readed-message", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-set-readed-message", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});*/
	/*
	// Client get total unread message
	socket.on("cl-get-total-unread-message", async(data)=>{
		try{
			const v= new niv.Validator(data, {
				secret_key : 'required'
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-get-total-unread-message",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						let result = await messageController.getTotalUnreadMessage(decoded._id);
						socket.emit("sv-get-total-unread-message", result);
					}
				});
			}else{
				socket.emit("sv-get-total-unread-message", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-get-total-unread-message", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});*/
	
});
app.get('/',(req,res)=>
	res.send('Server Thoy Mey Ben Oyyy')
);
app.get('/payment-success',(req,res)=>{
	res.send(req.query.paymentId);
});

app.get('/upload', (req,res)=>{
	res.sendFile(__dirname+'/upload.html');
});
app.get('/payment-failure',(req,res)=>
	res.send('Failure')
);
app.post('/avataruploader',(req,res)=>{
	if(req.files && req.body.secret_key){
		jwt.verify(req.body.secret_key,process.env.login_secret_key,async (err,decoded)=>{
			if(err){
				res.send({"success" : false});
			}
			if(decoded){
				var file = req.files.file;
				var allowedExtension = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp']
				if(allowedExtension.indexOf(file.mimetype)!= -1){
					let uploaded = await mediaController.avatarUpload(decoded._id, file.mimetype, file.size, "./public/images");
					if(uploaded.success == true){
						let mimetype = file.mimetype;
						name = uploaded.data+"."+mimetype.substring(mimetype.indexOf('/')+1,mimetype.length)
						file.mv('./public/images/'+name, async function(err){
							if(err){
								res.send(err);
							}else{
								let result = await userController.avatarChange(decoded._id, "https://taskeepererver.herokuapp.com/images/name/"+name);
								if(result.success == true){
									res.send({"success" : true});
								}else{
									res.send({"success" : false});
								}
							}
						});
					}else{
						res.send({"success" : false});
					}
				}else{
					res.send({"success" : false, "error" : "File format"});
				}
			}
		});
	}else{
		res.send({"success" : false, "error" : "Input data"});
	}
});

app.get('/accountverify',async(req,res)=>{
	if(req.query.userid && req.query.key){
		let checkUser = await userController.checkUserStatus(req.query.userid);
		if(checkUser.success == true){
			if(checkUser.status == 'unActive'){
				let result = await userController.setActivateByToken(req.query.userid, req.query.key);
				res.send(result);
			}else{
				res.send("Account already verified")
			}
		}else{
			res.send("Something wrong happen")
		}
	}
});
async function checkExist(userId){
	
	let id = await clients.find(el => el.userId == userId);
	if(id){
		return true;
	}
	return false;
}

async function getSocketID(userId){
	let id = await clients.find(el => el.userId == userId);
	if(id){
		return id["socketId"];
	}
}
async function addToList(userId, socketId){
	var clientInfo = new Object(); 
	clientInfo.userId   = userId; 
	clientInfo.socketId  = socketId; 
	clients.push(clientInfo); 
}

async function removeFromList(socketId){
	for(var i=0, len=clients.length; i<len; ++i){ 
		var c = clients[i]; 
 
		if(c.socketId == socketId){ 
			clients.splice(i,1); 
			break; 
		} 
	} 
}











  