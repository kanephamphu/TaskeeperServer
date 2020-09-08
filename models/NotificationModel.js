const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongo_URL || "mongodb+srv://tai123:tai123@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");
var Notification= new mongoose.Schema({
    user_id : {
        type: String
    },
    created_time : {
        type: Number,
        default: Date.now()
    },
    description : {
        type : String
    },
    type : {
        type : String
    },
    is_readed : {
        type : Boolean,
        default: false
    },
    task_id : {
        type : String
    }
});

const notification = mongoose.model("Notification",Notification);
module.exports = notification;