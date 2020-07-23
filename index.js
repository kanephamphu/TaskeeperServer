var express = require("express");
var app = express();
var path=require("path");
var bodyparser=require("body-parser");
var server= require("http").createServer(app);
var io=require("socket.io").listen(server);
var mongoose = require("mongoose");
var nodemailer= require("nodemailer");
var config = require('./config/default.json');
var login = require('./controllers/LoginController');
var randomToken = require("random-token").create('abcdefghijklmnopqrstuvwxzyABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
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

server.listen(process.env.PORT || 30200);
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
	socket.on("client-send-login-request", async function(data){
		console.log(data);
		console.log(data.loginquery);
		const result = await login.checkLogin(data.loginquery,data.password);
		console.log(result);
		if(result =='success'){
			jwt.sign(data,config.login_secret_key,(err,token)=>{
					socket.token = token;
					var loginresult = {
						"result" : result,
						"secret_key" : socket.token
					}
					socket.emit("server-send-login-respone",loginresult);
			});
		}else{
			var loginresult = {
				"result" : result
			}
			socket.emit("server-send-login-respone",loginresult);
		}
	});
	//Show list product
	

	//Disconnect
	socket.on('disconnect', function () {
		console.log(socket.id+" disconnected");
	});
});

app.get('/verify/:token', function(request, response, next) {
	console.log(request.params.token);
	User.updateOne({"VERIFY_TOKEN":request.params.token},{"STATUS":"isActive"}).exec((err, result)=>{
			console.log(result);			
	});
	response.send("Verify account successfully");
	response.render("verify.ejs");
  }); 
app.post('/api/login',(req,res)=>{
	const user = {
		id: 1,
		username: 'brasssdssdfs',
		email: 'tai123@gmail.com'
	}
	jwt.sign({user},'secretkey',(err,token)=>{
		res.json({
			token
		});
	});

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
app.post('/api/singout',verifyToken,(req,res)=>{
	jwt.verify(req.token,'secretkey',(err,authData)=>{
		if(err){
			res.sendStatus(403);
		}else{
			jwt.decode(req.token);
		}
	})
});
function verifyToken(req,res,next) {
	// Get auth header value
	console.log(req);
	const bearerHeader =req.query.Authorization;
	// Check if bearer is undifiend
	if(typeof bearerHeader !== 'undefined'){
		//Split at the space
		const bearer = bearerHeader.split(' ');
		const bearerToken = bearer[1];
		req.token = bearerToken;
		next();
	}else{
		//Forbidden
		res.sendStatus(403);
	}
}


  