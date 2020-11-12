const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongo_URL || "mongodb+srv://tai123:tai123@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");
var Wall= new mongoose.Schema({
    user_id : {
        type : String,
        index : true
    },
    wall : [{
        task_id : {
            type : String
        }
    }]
});

const wall = mongoose.model("Wall",Wall);
module.exports = wall;