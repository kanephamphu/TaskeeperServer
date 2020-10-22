const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongo_URL || "mongodb+srv://tai123:tai123@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");
var MoneyTransaction= new mongoose.Schema({
    sender_id : {
        type: String
    },
    receiver_id : {
        type : String
    },
    money_amount : {
        type : {
            Number
        }
    },
    transaction_time : {
        type : Number,
        default : Date.now()
    },
    description : {
        type: String
    },
    type : {
        type : String, 
        enum : ['server','user'],
        default : 'user'
    }
});

const moneytransaction = mongoose.model("MoneyTransaction",MoneyTransaction);
module.exports = moneytransaction;