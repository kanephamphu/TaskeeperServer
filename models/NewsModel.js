const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongo_URL || "mongodb+srv://tai123:tai123@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");
var News= new mongoose.Schema({
    user_id : {
        type: String,
        index : true,
        unique : true
    },
    task_news : [{
        task_id : {
            type : String
        }
    }]
});

const news = mongoose.model("News",News);
module.exports = news;