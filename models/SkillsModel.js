const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongo_URL || "mongodb+srv://tai123:tai123@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");
var SkillSchema= new mongoose.Schema({
    skill_name : {
        type: String,
        index : true
    },
    created_time : {
        type : Number,
        default: Date.now()
    }
});

SkillSchema.index(
    {
        skill_name : "text"
    }
);  
const skills = mongoose.model("Skills",SkillSchema);
module.exports = skills;