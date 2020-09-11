const news = require('../models/NewsModel');
const user = require('../models/UsersModel');
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


//addFollowers("5f15dee66d224e19dcbf6bbf","5f1c5df095199238c4282655");

/*async function test(){
    //let te = await addNews("123","3443","2342346","Tai", "sdfsf", "Thanh An", "unextract", 34, 67, "freelance", "Taa", 123123);
    //console.log(te);
    //let t = await deleteNews("123","234234");
    //console.log(t);
}*/

module.exports.addNews = addNews;
module.exports.addNewsToFollowers = addNewsToFollowers;
module.exports.deleteNews = deleteNews;