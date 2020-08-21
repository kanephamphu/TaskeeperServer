const mongoose= require("mongoose");
require('dotenv').config();
mongoose.connect(process.env.mongo_URL || "mongodb+srv://tai123:tai123@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");

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