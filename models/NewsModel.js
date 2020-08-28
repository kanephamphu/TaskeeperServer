const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongo_URL || "mongodb+srv://tai123:tai123@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");
var News= new mongoose.Schema({
    user_id : {
        type: String
    },
    task_news : [{
        task_id : {
            type : String
        },
        task_owner_id : {
            type : String
        },
        title : {
            type : String
        },
        description : {
            type : String
        },
        location : {
            type : String
        },
        price: {
            price_type : {
                type: String,
                enum: ['unextract','dealing'],
                default: 'unextract'
            },
            floor_price : Number,
            ceiling_price : Number
        },
        task_type : {
            type: String,
            enum: ['full-time','part-time','freelance'],
            default: 'freelance'
        },
        task_owner_avatar : {
            type : String
        },
        created_time : {
            type : Number
        }
    }]
});

const news = mongoose.model("News",News);
module.exports = news;