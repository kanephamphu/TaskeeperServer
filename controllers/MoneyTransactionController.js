const moneytransaction = require('../models/MoneyTransactionModel');
const paymentcontroller = require('../controllers/PaymenHistoryController');
const mongoose = require('mongoose');
const user = require('../models/UsersModel');
//Add money transaction
async function addMoneyTransaction(sender_id, receiver_id, money_amount, description){
    let receiver_amount = await paymentcontroller.getCurrentWalletAmount(receiver_id);
    let sender_amount = await paymentcontroller.getCurrentWalletAmount(sender_id);
    
    if(sender_amount<money_amount){
        return {"success" : false, "errors" : {"message" : "Not enough money in wallet"}};
    }else{
        const session = await mongoose.startSession();
        session.startTransaction();
        try{
            sender_amount = sender_amount - money_amount;
            receiver_amount = receiver_amount + money_amount;
            let transaction_docs = {
                "sender_id" : sender_id,
                "receiver_id" : receiver_id,
                "money_amount" : money_amount,
                "description" : description,
                "type" : 'user'
            };
            
            await moneytransaction.create([transaction_docs], { session: session });
            await user.updateOne({"_id" : sender_id}, {"wallet.amount" : sender_amount},  { session: session });
            await user.updateOne({"_id" : receiver_id}, {"wallet.amount" : receiver_amount}, { session: session }); 
            await session.commitTransaction();
            session.endSession();
            return {"success": true};
        }catch(e){
            await session.abortTransaction();
            session.endSession();
            return {"success" : false};
        }
        
        
    }
}

//Add system payment money transaction
async function addPaymentTransaction(receiver_id, money_amount, description){
    let receiver_amount = await paymentcontroller.getCurrentWalletAmount(receiver_id);
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        receiver_amount = receiver_amount + money_amount;
        let transaction_docs = {
            "receiver_id" : receiver_id,
            "money_amount" : money_amount,
            "description" : description,
            "type" : "server"
        };
        await moneytransaction.create([transaction_docs], { session: session });
        await user.updateOne({"_id" : receiver_id}, {"wallet.amount" : receiver_amount}, { session: session }); 
        await session.commitTransaction();
        session.endSession();
    }catch(e){
        await session.abortTransaction();
        session.endSession();
        return {"success" : false};
    }
}

//Add payment transaction
async function addWithdrawalTransaction(sender_id, money_amount, description){
    let sender_amount = await paymentcontroller.getCurrentWalletAmount(sender_id);
    if(money_amount<=0){
        return {"success" : false, "errors" : {"message" : "Money amount must more than zero"}};
    }
    if(sender_amount<money_amount){
        return {"success" : false, "errors" : {"message" : "Not enough money in wallet"}};
    }else{
        const session = await mongoose.startSession();
        session.startTransaction();
        try{
            sender_amount = sender_amount - money_amount;
            let transaction_docs = {
                "sender_id" : sender_id,
                "money_amount" : money_amount,
                "description" : description,
                "type" : "server"
            };
            await moneytransaction.create([transaction_docs], { session: session });
            await user.updateOne({"_id" : sender_id}, {"wallet.amount" : sender_amount},  { session: session });
            await session.commitTransaction();
            session.endSession();
        }catch(e){
            await session.abortTransaction();
            session.endSession();
            return {"success" : false};
        }
        
        
    }
}

// Get list money transaction data
async function getTransactionData(user_id, number_transaction, skip){
    let result = await moneytransaction.find({
        $or : [
            {"sender_id" : user_id},
            {"receiver_id" : user_id}
        ]
    },{},{limit : number_transaction, skip: skip});
    if(result){
        console.log(result);
        return {"success" : true, "data" : result}
    }
    return {"success" : false}
}
//getTransaction("5f15dee66d224e19dcbf6bbf",10,0)
//addMoneyTransaction("5f15dee66d224e19dcbf6bbf", "5f2546def9ca2b000466c467", 12, "User to user");
module.exports.addMoneyTransaction = addMoneyTransaction;
module.exports.addPaymentTransaction = addPaymentTransaction;
module.exports.addWithdrawalTransaction = addWithdrawalTransaction;
module.exports.getTransactionData = getTransactionData;

