const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongo_URL || "mongodb+srv://tai123:tai123@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");
var Tags= new mongoose.Schema({
    tag : {
        type : String
    },
    tag_using_count : {
        type : Number
    },
    created_time : {
        type: Number,
        default: Date.now()
    }
});

const tags = mongoose.model("Tags",Tags);
module.exports = tags;