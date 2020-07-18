var express = require("express");
var app = express();
var path=require("path");
var bodyparser=require("body-parser");
var server= require("http").createServer(app);
var io=require("socket.io").listen(server);
var mongoose = require("mongoose");
let User= require("./models/UserModel");
let Product= require("./models/ProductModel");
var nodemailer= require("nodemailer");
var randomToken = require("random-token").create('abcdefghijklmnopqrstuvwxzyABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
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
mongoose.connect("mongodb+srv://admin:admin@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority").then(
	()=>{
		console.log("Connect DB succesfully");
	},
	err=>{
		console.log("Failed to connect to database");
	}
);


io.sockets.on('connection',function(socket){
	console.log(socket.id+" is connecting");
	
	// Client say hello
	socket.on("client-say-hello",function(data){
		console.log(data);
		//Server say hello 
		socket.emit("server-say-hello",'SERVER SAY HELLO');
	});
	//Register server listener
	socket.on("client-send-register-require",function(data){
		var result;
		var token=randomToken(64);
		User.create({
			"FIRST_NAME": data.FIRST_NAME,
			"LAST_NAME": data.LAST_NAME,
			"EMAIL": data.EMAIL,
			"PASS_WORD": data.PASS_WORD,
			"VERIFY_TOKEN": token
		},function(err,small){
			if(err){
				console.log("Cann't register");
				result='failed';
			}
				
			else
			{
				var mail={
					from: 'Tai Pham',
					to: data.EMAIL,
					subject: 'Verify email infomation to '+data.FIRST_NAME,
					text: 'User infomation',
					html: '<h1>'+'Hi, '+data.FIRST_NAME+'<br>Verify infomation</h1><br><p>Username:</p>'+data.EMAIL+' <br><p>Password:</p>'+data.PASS_WORD+"<br> Verify link: http://192.168.1.2:3000/verify/"+token
				};
				transporter.sendMail(mail,function(err,info){
					if(err)
						console.log("Cann't send email");
					else
						console.log(info.response);
				});
				result='success';
				socket.emit("server-send-register-result",{result:result});
			}		
		});	
	});

	//Login server listener, if the account status is unActive send result unActive to client
	socket.on("client-send-login-require",function(data){
		console.log(data);
		User.count({"EMAIL":data.EMAIL, "PASS_WORD":data.PASS_WORD},function(err,small){
			var result;
			if(err){
				console.log("Cann't login");
				result='failed';
				socket.emit("server-send-login-result",{result: result});
			}else{
				if(small>0){
					User.find({"EMAIL":data.EMAIL},"STATUS",function(err,res){
						console.log(res[0].STATUS);
						if(res[0].STATUS=="isActive"){
							result="success";
							console.log("HEE"+res[0].STATUS);
							console.log(result+" checked");
							socket.email=data.EMAIL;
							socket.FIRST_NAME=data.FIRST_NAME;
							socket.emit("server-send-login-result",{"result": result,"EMAIL":socket.email,"FIRST_NAME":socket.FIRST_NAME});
						}else{
							result="unActive";
							socket.emit("server-send-login-result",{result: result});
						}
						
					});
				}else{
					result="failed";
					socket.emit("server-send-login-result",{result: result});
				}
			}
		});
		
	});
	//Show list product
	socket.on("client-send-product-show",function(data){
		console.log("RECEIVE 2");
		if(data==null){
			
			Product.find({},{},{sort:{PRODUCT_NAME:-1},limit:20},function(err,res){
				socket.emit("server-send-product",data);
			});
		}
	});

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
  Product.create({
	"PRODUCT_NAME": "Tivi",
	"PRODUCT_DETAIL": "Tivi dep theehhehehe",
	"EMAIID_SUPPLIERL": "123123",
	"PRICE": 10000000,
	"PRODUCT_IMAGE": "https://taskeepererver.herokuapp.com:3000/images/tivi.jpg",
	"SALE_PERCENT": 10
},function(err,small){
	if(err){
		console.log("Cann't add to");
	}	
});	

  