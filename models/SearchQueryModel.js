const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongo_URL || "mongodb+srv://tai123:tai123@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");
var SearchQuery= new mongoose.Schema({
    query_string : {
        type : String
    },
    search_count : {
        type : Number
    },
    search_count_recently : {
        type : Number
    }
});

const searchquery = mongoose.model("SearchQuery",SearchQuery);
module.exports = searchquery;