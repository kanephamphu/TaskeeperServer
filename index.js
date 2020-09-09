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
const searchquery = require("./models/SearchQueryModel");
const searchController = require('./controllers/SearchController');
const messageController = require('./controllers/MessageController');
const user = require("./models/UsersModel");

server.listen(process.env.PORT || 3000);
require('dotenv').config()

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 200 // limit each IP to 200 requests per windowMs
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
					//, { expiresIn: 60*60*24 }
					jwt.sign(tokenInformation,process.env.login_secret_key,(err,token)=>{
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
						let result = await userController.addNewEducationInformation(decoded._id,data.working_id,data.specialize,data.required);
						socket.emit("sv-edit-working",result);
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
				working_id : 'required' 
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-delete-working",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						let result = await userController.deleteWorkingInformation(decoded._id,data.working_id);
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
			const v= niv.Validator(data, {
				secret_key : 'required',
				education_id : 'required',
				education_name : 'required',
				education_description : 'required'
			});
			const matched = v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-edit-edu",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						let result = await userController.editEducationInformation(decoded._id,data.education_id,data.education_name,data.education_description);
						socket.emit("sv-edit-edu",result);
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
	socket.on("cl-delete-working", async(data)=>{
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
				floor_price : 'required',
				ceiling_price : 'required' 
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-apply-job",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						let result = await tasksController.addApplicationJob(decoded._id,data._task_id,data.introduction,data.floor_price,data.ceiling_price);
						socket.emit("sv-apply-job",result);
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
						let result = await tasksController.deleteApplicationJob(decoded._id, data.task_id);
						socket.emit("sv-apply-job",result);
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
				task_id : 'required',
				introduction : 'required',
				floor_price : 'required',
				ceiling_price : 'required' 
			});
			const matched = await v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-follow-user",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						let result = await userController.addFollower(data.user_id, decoded._id);
						socket.emit("sv-follow-user",result);
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
			const matched = v.check();
			if(matched){
				let result = await searchqueryController.searchAutoComplete(data.search_string);
				console.log(result);
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
			const matched = v.check();
			if(matched){
				let result = await searchController.searchUser(data.search_string);
				socket.emit("sv-search-user", {"success" : true, "data" : result});
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
			const matched = v.check();
			if(matched){
				let result = await searchController.searchTask(data.search_string);
				socket.emit("sv-search-task", {"success" : true, "data" : result});
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
				day_of_birth : 'required',
				month_of_birth : 'required',
				year_of_birth : 'required'
			});
			const matched = v.check();
			console.log(matched);
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-edit-info",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						console.log("Ok")
						let result = await userController.editPersonalInfo(decoded._id,data.first_name, data.last_name, data.email,
							data.phone_number, data.gender, data.day_of_birth, data.month_of_birth, data.year_of_birth);
						socket.emit("sv-edit-info", result);
					}
				})
			}else{
				console.log("Khong duoc");
				socket.emit("sv-edit-info", {"success": false, "errors" : v.errors})
			}
		}catch(e){
			socket.emit("sv-edit-info", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});

	// Add new message
	socket.on("cl-new-text-message", async(data)=>{
		try{
			const v=new niv.Validator(data, {
				secret_key : 'required',
				receiver_id : 'required',
				message_text : 'required'
			});
			const matched = v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-new-text-message",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						let result = await messageController.addMessage(decoded._id,data.receiver_id, 'text', data.message_text, null);
						socket.emit("sv-new-text-message", result);
					}
				})
			}else{
				socket.emit("sv-new-text-message", {"success": false, "errors" : v.errors});
			}
		}catch(e){
			socket.emit("sv-new-text-message", {"success" : false, "errors" : {"message" : "Undefined error"}});
		}
	});

	// Get follower list
	socket.on("cl-get-followers", async(data)=>{
		try {
			const v=new niv.Validator(data, {
				secret_key : 'required'
			});
			const matched = v.check();
			if(matched){
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

	// Get apply list 
	socket.on("cl-get-apply-job-list", async(data)=>{
		try {
			const v=new niv.Validator(data, {
				secret_key : 'required',
				task_id : 'required'
			});
			const matched = v.check();
			if(matched){
				jwt.verify(data.secret_key,process.env.login_secret_key,async (err,decoded)=>{
					if(err){
						socket.emit("sv-get-apply-job-list",{"success":false, "errors":{"message": "Token error", "rule" : "token"}});
					}
					if(decoded){
						let result = await tasksController.getApplyList(data.task_id);
						socket.emit("sv-get-apply-job-list", result);
					}
				})
			}
		} catch (e) {
			socket.emit("sv-get-apply-job-list", {"success" : false, "errors" : {"message" : "Undefined error"}});
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






  