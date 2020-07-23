// 1. Require mongoose
const mongoose= require("mongoose");
var randomToken = require("random-token").create('abcdefghijklmnopqrstuvwxzyABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
var config= require('../config/default.json');
mongoose.connect(config.ConnectMongo);

var ProductSchema=new mongoose.Schema({
	PRODUCT_NAME:{
		type: String
	},
	PRODUCT_DETAIL:{
		type: String
	},
	ID_SUPPLIER:{
		type: String
	},
	PRICE:{
		type: String
	},
	SALE_PERCENT:{
		type: String,
		default: randomToken(16)
	},
	CREATED_TIME:{
		type: Number,
		default: Date.now()
	},
	STATUS:{
			type: String,
			enum: ['unActive','isActive','stop'],
			default: 'isActive'
	},
	PRODUCT_AMOUNT:{
		type:Number,
		default: 0
	},
	PRODUCT_IMAGE:{
		type:String
	}
});

const product = mongoose.model("Product",ProductSchema);
module.exports=product;