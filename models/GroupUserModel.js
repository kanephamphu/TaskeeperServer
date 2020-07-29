const mongoose= require("mongoose");
mongoose.connect(process.env.mongo_URL);
require('dotenv').config()
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