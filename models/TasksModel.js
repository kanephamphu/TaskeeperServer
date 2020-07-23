const mongoose = require('mongoose');
var config= require('../config/default.json');
mongoose.connect(config.ConnectMongo);
var Tasks= new mongoose.Schema({
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
        dealing_price: {
            type: Number
        }
    }],
    _id_employee: {
        _id_employee: {
            type: String
        },
        price: {
            type: Number
        }
    },
    tags: [{
        tag_id: {
            type: String
        },
        tag_description: {
            type: String
        }
    }],
    images: [{
        id_images: {
            type: String
        },
        image_url: {
            type: String
        },
        description: {
            type: String
        }
    }]
});

const tasks = mongoose.model("Tasks",Tasks);
module.exports = tasks;