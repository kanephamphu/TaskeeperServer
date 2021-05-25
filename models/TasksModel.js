const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongo_URL || "mongodb+srv://tai123:tai123@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");
var Tasks= new mongoose.Schema({
    task_title: {
        type: String,
        default : ""
    },
    task_description: {
        type: String
    },
    task_requirement : {
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
    location : {
        formatted_address : {
            type : String
        },
        geometry : {
            location : {
                type : {
                    type : String, 
                    default : 'Point',
                    enum: ['Point'], // 'location.type' must be 'Point'
                },
                coordinates : {
                    type : [Number],
                    index : '2dsphere'
                }
            }
        }
    },
    working_time : {
        start_time : {
            type : String
        },
        end_time : {
            type : String
        }
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
            type: String,
            index : true
        },
        introduction: {
            type: String
        },
        candidate_first_name : {
            type : String
        },
        candidate_last_name : {
            type : String
        },
        candidate_avatar: {
            type : String
        },
        price : {
            type: Number
        },
        applied_time : {
            type : Number,
            default : Date.now()
        },
        updated_time : {
            type : Number
        },
        status : {
            type : String,
            enum : ["applied", "unapplied", "deleted"],
        }
    }],
    work_employee_list: [{
        employee_id : {
            type : String,
            index : true
        },
        employee_first_name : {
            type : String
        },
        employee_last_name : {
            type : String
        },
        employee_avatar: {
            type : String
        },
        approved_time : {
            type : Number,
            default : Date.now()
        },
        updated_time : {
            type : Number
        },
        status : {
            type : String,
            enum : ["approved", "unapproved", "deleted", "done"],
            default : "approved" 
        }
    }],
    tags: 
    {
        type: [String],
        default : []
    },
    created_time : {
        type: Number,
        default: Date.now()
    },
    languages : [{
        type: [String],
        default : []
    }],
    industry: [{
        type: String
    }],
    position : {
        type: String
    },
    skills: [{
        type: String
    }],
    isDone: {
        type: Boolean,
        default : false
    },
    end_day: {
        type: Number
    },
    end_month: {
        type: Number
    },
    end_year: {
        type: Number
    },
    impression : {
        type : Number,
        default : 0
    },
    status : {
        type : String,
        default : 'active',
        enum : ['deleted','active']
    }, 
    image: {
        type: String
    }
});

Tasks.index(
    {
        task_title : "text",
        task_description : "text",
        tags : "text",
        task_owner_first_name : "text",
        task_owner_last_name : "text",
        task_type : "text",
        "location.formatted_address" : "text"
    }
);  

const tasks = mongoose.model("Tasks",Tasks);
module.exports = tasks;