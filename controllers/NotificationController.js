const notification = require('../models/NotificationModel');

//Add new notification 
async function addNotification(user_id, description, task_id){
    let result = notification.create({
        "user_id" : user_id,
        "description" :description,
        "task_id" : task_id
    })
    if(result){
        return {"success" : true}
    }else{
        return {"success" : false}
    }
}

module.exports.addNotification = addNotification;