const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongo_URL || "mongodb+srv://tai123:tai123@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");
var IndustriesSchema= new mongoose.Schema({
    name : {
        type: String,
        index : true
    },
    detail : [{
        name : {
            type : String
        }
    }],
    createdAt : {
        type : String 
    },
    language : {
        type : String,
        enum : ['vi','en']
    }
});

const industries = mongoose.model("Industries",IndustriesSchema);
module.exports = industries;