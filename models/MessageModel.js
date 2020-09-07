const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongo_URL || "mongodb+srv://tai123:tai123@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");
var Message = new mongoose.Schema({
    sender_id : {
        type: String
    },
    receiver_id : {
        type : String
    },
    message_text : {
        type : String
    },
    message_type: {
        type: String,
        enum : ['text','image']
    },
    message_link : {
        type: String
    },
    create_time : {
        type: Number,
        default: Date.now()
    },
    is_readed : {
        type: Boolean,
        default: false
    }
});


const message = mongoose.model("Messages",Message);
module.exports = message;