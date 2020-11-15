const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongo_URL || "mongodb+srv://tai123:tai123@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");
var Media= new mongoose.Schema({
    mimetype : {
        type: String,
        enum : ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp']
    },
    size : {
        type : Number
    },
    file_location : {
        type : String
    },
    created_time : {
        type: Number,
        default: Date.now()
    },
    owner_id : {
        type : String
    }
});

const media = mongoose.model("Media",Media);
module.exports = media;