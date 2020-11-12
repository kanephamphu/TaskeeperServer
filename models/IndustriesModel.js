const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongo_URL || "mongodb+srv://tai123:tai123@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");
var IndustriesSchema= new mongoose.Schema({
    industry_name : {
        type: String
    },
    career_name : {
        type : String
    },
    created_time : {
        type : Number,
        default: Date.now()
    },
    language : {
        type : String,
        enum : ['vi','en']
    }
});

const industries = mongoose.model("Industries",IndustriesSchema);
module.exports = industries;