// 1. Require mongoose
const mongoose= require("mongoose");
var randomToken = require("random-token").create('abcdefghijklmnopqrstuvwxzyABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
mongoose.connect("mongodb+srv://admin:admin@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");

var UserSchema=new mongoose.Schema({
	FIRST_NAME:{
		type: String
	},
	LAST_NAME:{
		type: String
	},
	EMAIL:{
		type: String
	},
	PASS_WORD:{
		type: String
	},
	USERNAME:{
		type: String,
		default: randomToken(16)
	},
	GENDER:{
		type:Date
	},
	PHONE_NUMER:{
		type: String
	},
	CREATED_TIME:{
		type: Number,
		default: Date.now()
	},
	STATUS:{
			type: String,
			enum: ['unActive','isActive','suspended'],
			default: 'unActive'
	},
	VERIFY_TOKEN: {
		type: String,
		default: "00001"
	},
	ROLE:{
		type:String,
		default: "customer"
	}
});

const user = mongoose.model("User",UserSchema);
module.exports=user;