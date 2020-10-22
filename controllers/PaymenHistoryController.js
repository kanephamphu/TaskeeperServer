const user = require('../models/UsersModel');

// Add payment information to user
async function addPaymentHistory(user_id, payer_name, payer_payment_id, amount){
    let payment_information = {
        "payer_name" : payer_name,
        "payer_payment_id" : payer_payment_id,
        "amount.currency" : "USD",
        "amount.total" : amount
    };
    let result = await user.updateOne({"_id" : user_id}, {
        $push : {
            "payment_history" : payment_information
        }
    });
    if(result){
        return {"success" : true};
    }else{
        return {"success" : false};
    }
}

//Update money status
async function updateSuccess(user_id, payer_payment_id){
    let result = await user.updateOne({'_id' : user_id, "payment_history.payer_payment_id" : payer_payment_id}, {
        "$set" : {
            "payment_history.$.success" : true
        }
    });
    return result;
}

//Update money updated
async function updateMoney(user_id, payer_payment_id){
    let payment_information = await user.findOne({"_id": user_id, "payment_history.payer_payment_id" : payer_payment_id},["payment_history.amount.total","payment_history.is_money_updated"]);
    if(payment_information.payment_history[0].is_money_updated===false){
        let amount = payment_information.payment_history[0].amount.total + await getCurrentWalletAmount(user_id);
        let result = await user.updateOne({"_id" : user_id, "payment_history.payer_payment_id" : payer_payment_id}, {
            "wallet.amount" : amount,
            "$set" : {
                "payment_history.$.is_money_updated" : true
            }
        });
        if(result){
            return {"success" : true};
        }else{
            return {"success" : false};
        }
    }else{
        return {"success" : false, "data" : {"message" : "Already updated"}};
    }
}

//Get current amount
async function getCurrentWalletAmount(user_id){
    let current_amount = await user.findOne({"_id" : user_id}, ["wallet.amount"]);
    return current_amount.wallet.amount;
}

//addPaymentHistory("5f15dee66d224e19dcbf6bbf","paypal", "PP-3434", 5);
//updateSuccess("5f15dee66d224e19dcbf6bbf", "PP-3434");
//updateMoney("5f15dee66d224e19dcbf6bbf","PP-3434");
//getCurrentWalletAmount("5f15dee66d224e19dcbf6bbf");
module.exports.addPaymentHistory = addPaymentHistory; 
module.exports.updateMoney = updateMoney;
module.exports.updateSuccess = updateSuccess;
module.exports.getCurrentWalletAmount = getCurrentWalletAmount;