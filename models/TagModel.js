const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongo_URL || "mongodb+srv://tai123:tai123@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");
var Tag= new mongoose.Schema({
    tag : {
        type : String
    },
    tag_using_count : {
        type : Number
    }
});

const tag = mongoose.model("Tag",Tag);
module.exports = tag;