const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongo_URL || "mongodb+srv://tai123:tai123@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");
var Media= new mongoose.Schema({
    media_id : {
        type: String
    },
    media_type : {
        type: String
    },
    created_time : {
        type: Number,
        default: Date.now()
    },
    file_upload : {
        type : String
    },
    subject : {
        type: String
    }
});

const media = mongoose.model("Media",Media);
module.exports = media;