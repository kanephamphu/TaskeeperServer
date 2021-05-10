const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
require('dotenv').config();
mongoose.connect(process.env.mongo_URL || "mongodb+srv://tai123:tai123@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");
var MessageSchema = new mongoose.Schema({
    text : {
        type : String
    },
    createdAt : {
        type : Number,
        default : Date.now()
    },
    user : {
        _id : {
            type : mongoose.Schema.Types.ObjectId
        },
        name : {
            type : String
        },
        avatar : {
            type : String
        }
    },
    image : {
        type : String
    },
    video : {
        type : String
    },
    audio : {
        type : String
    },
    sent : {
        type : Boolean,
        default : true
    },
    received : {
        type : Boolean,
        default : false
    },
    receiver_id : {
            type : mongoose.Schema.Types.ObjectId,
            index : true   
    },
    room : {
        type : mongoose.Schema.Types.ObjectId,
        index : true,
        default : new ObjectID()   
    }
});


const message = mongoose.model("Messages",MessageSchema);
module.exports = message;