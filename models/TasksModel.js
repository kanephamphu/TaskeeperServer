const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongo_URL || "mongodb+srv://tai123:tai123@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");
var Tasks= new mongoose.Schema({
    task_title: {
        type: String
    },
    task_description: {
        type: String
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
    location : {
        type: String
    },
    task_type : {
        type: String,
        enum: ['full-time','part-time','freelance'],
        default: 'freelance'
    },
    task_owner_id: {
        type: String,
        index : true
    },
    task_owner_first_name : {
        type: String
    },
    task_owner_last_name : {
        type : String
    },
    task_owner_avatar : {
        type : String
    },
    task_candidate_apply_list: [{
        candidate_id: {
            type: String
        },
        introduction: {
            type: String
        },
        floor_price : Number,
        ceiling_price : Number
    }],
    work_employee: [{
        employee_id: {
            type: String
        }
    }],
    tags: [
        {
            type: String
        }
    ],
    created_time : {
        type: Number,
        default: Date.now()
    },
    languages : {
        type: String
    },
    industry: {
        type: String
    },
    position : {
        type: String
    },
    skills: [{
        type: String
    }],
    isDone: {
        type: Boolean
    },
    day_of_working_done: {
        type: Number
    },
    month_of_working_done: {
        type: Number
    },
    year_of_working_done: {
        type: Number
    },
    impression : {
        type : Number
    }
});

Tasks.index(
    {task_title : "text",
    task_description : "text",
    location : "text"
    }
);  

const tasks = mongoose.model("Tasks",Tasks);
module.exports = tasks;