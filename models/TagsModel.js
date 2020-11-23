const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongo_URL || "mongodb+srv://tai123:tai123@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");
var Tags= new mongoose.Schema({
    name : {
        type : String,
        index : true
    },
    tag_using_count : {
        type : Number
    },
    tag_month_using_count : {
        type : Number
    },
    created_time : {
        type: Number,
        default: Date.now()
    }
});

Tags.index(
    {
        name : "text"
    }
);  
const tags = mongoose.model("Tags",Tags);
module.exports = tags;