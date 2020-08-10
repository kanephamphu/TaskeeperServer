const mongoose = require('mongoose');
mongoose.connect(process.env.mongo_URL);
require('dotenv').config()
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
        type: String
    },
    task_candidate_list: [{
        _id_candidate: {
            type: String
        },
        information: {
            type: String
        },
        floor_price : Number,
        ceiling_price : Number,
        extract_price: Number
    }],
    _id_employee: {
        _id_employee: {
            type: String
        },
        price: {
            type: Number
        }
    },
    tags: [
        {
            type: String
        }
    ],
    created_time : {
        type: Number,
        default: Date.now()
    },
    languages : [{
        type: String
    }],
    industry: {
        type: String
    },
    position : {
        type: String
    },
    skills: [{
        type: String
    }],
    votes : [{
        voter_id : String,
        vote_point : Number
    }]
});

const tasks = mongoose.model("Tasks",Tasks);
module.exports = tasks;