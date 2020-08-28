const news = require('../models/NewsModel');

// Add task to news
async function addNews(user_id, task_owner_id, task_id, title, description, location,price_type,floor_price, ceiling_price,task_type,task_owner_avatar,created_time){
    try{
        let isExist = await news.findOne({"user_id" : user_id});
        console.log(isExist);
        // If user id is exist in database then update new news item else create new user news
        if(isExist){
            console.log("heher");
            let result = await news.update({"user_id" : user_id}, 
                {
                    $push : {
                        "task_news" : {
                            "task_id" : task_id,
                            "task_news" : title,
                            "task_owner_id" : task_owner_id,
                            "description" : description,
                            "location" : location,
                            "price.price_type" : price_type,
                            "price.floor_price" : floor_price,
                            "price.ceiling_price" : ceiling_price,
                            "task_type" : task_type,
                            "task_owner_avatar" : task_owner_avatar,
                            "created_time" : created_time
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
                        "task_id" : task_id,
                        "task_news" : title,
                        "task_owner_id" : task_owner_id,
                        "description" : description,
                        "location" : location,
                        "price.price_type" : price_type,
                        "price.floor_price" : floor_price,
                        "price.ceiling_price" : ceiling_price,
                        "task_type" : task_type,
                        "task_owner_avatar" : task_owner_avatar,
                        "created_time" : created_time
                    } 
                });
            console.log(result);
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

async function test(){
    let te = await addNews("123","3443","2342346","Tai", "sdfsf", "Thanh An", "unextract", 34, 67, "freelance", "Taa", 123123);
    console.log(te);
    let t = await deleteNews("123","234234");
    console.log(t);
}

module.exports.addNews = addNews;
module.export.deleteNews = deleteNews;