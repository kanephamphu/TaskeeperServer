const mongoose= require("mongoose");
var config= require('../config/default.json');
mongoose.connect(config.ConnectMongo);
var GroupUser = new mongoose.Schema({
    group_name: {
        type: String,
        unique: true
    },
    created_time: {
        type: Number,
        default: Date.now()
    },
    updated_time: {
        type: Number
    },
    functions: [{
            _id: {
                type: String
            },
            function_name: {
                type: String
            },
            action: {
                type: String
            },
            created_time: {
                type: Number,
                default: Date.now()
            },
            updated_time: {
                type: Number
            }
        }]
});

const groupuser = mongoose.model("GroupUser", GroupUser);
module.exports = groupuser;