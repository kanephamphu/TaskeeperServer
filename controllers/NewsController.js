const news = require('../models/NewsModel');
const user = require('../models/UsersModel');
const task = require('../models/TasksModel');
// Add task to news
async function addNews(user_id, task_id){
    try{
        let isExist = await news.findOne({"user_id" : user_id});
        // If user id is exist in database then update new news item else create new user news
        if(isExist){
            let result = await news.update({"user_id" : user_id}, 
                {
                    $push : {
                        "task_news" : {
                            $each : [{
                                "task_id" : task_id
                            }],                       
                            $position : 0
                    }
                }
            });
            if(result){
                return {"success" : true};
            }else{
                return {"success" : false};
            }
        }else{
            let result = await news.create(
                {
                    "user_id" : user_id,
                    "task_news" : {
                        "task_id" : task_id
                    } 
                });
            if(result){
                return {"success" : true};
            }else{
                return {"success" : false};
            }
        }
    }catch(e){
        throw(e);
    }
}

//addNews("5f2546def9ca2b000466c467", "5f1c581dcde7010774853652")
//addNews("5f2546def9ca2b000466c467", "5f1c5da395199238c4282654")
//Remove news from task_news for one user
async function deleteNews(user_id,task_id){
    try{
        let isExist = await news.findOne({"user_id" : user_id, "task_news.task_id" : task_id});
        if(isExist){
            let result = await news.update({"user_id" : user_id}, 
            {
                $pull : {
                    "task_news" : {
                        "task_id" :task_id
                    }
                }
            });
            if(result){
                return {"success" : true};
            }
            return {"success" : false};
        }else{
            return {"success" : false};
        }
    }catch(e){
        throw(e);
    }
}

// Add news to followers
async function addNewsToFollowers(user_id, task_id){
    let listFollowers = await user.findOne({"_id" : user_id}, "followers.follower_id");
    for(let i =0;i < listFollowers.followers.length; i++){
        addNews(listFollowers.followers[i].follower_id, task_id)
    }
} 

// Get top number news
async function getNewsData(user_id, number_task, skip){
    let tasknews = await news.findOne({"user_id" : user_id}, {
        "task_news" : {
            $slice : [skip,number_task]
        }
    });
    if(tasknews){
        let task_id = tasknews.task_news;
        let list_task_id = [];
        for(let i in task_id){
            list_task_id.push(task_id[i].task_id)
        }
        let result = await task.find({"_id": {
            $in : list_task_id
        }}, ["_id", "task_title", "task_description", "created_time","location", "price.price_type", "price.floor_price", "price.ceiling_price","task_owner_id", "task_owner_first_name", "task_owner_last_name", "task_owner_avatar"]);
        if(result){
            return {"success" : true, "data" : result};
        }else{
            return {"success" : false};
        }
    }
    return {"success" : true, "data" : [{}]};
    
}

//addFollowers("5f15dee66d224e19dcbf6bbf","5f1c5df095199238c4282655");
//getNewsData("5f19a01bb989ab4374ab6c09",5,5)
/*async function test(){
    //let te = await addNews("123","3443","2342346","Tai", "sdfsf", "Thanh An", "unextract", 34, 67, "freelance", "Taa", 123123);
    //console.log(te);
    //let t = await deleteNews("123","234234");
    //console.log(t);
}*/

module.exports.getNewsData = getNewsData;
module.exports.addNews = addNews;
module.exports.addNewsToFollowers = addNewsToFollowers;
module.exports.deleteNews = deleteNews;