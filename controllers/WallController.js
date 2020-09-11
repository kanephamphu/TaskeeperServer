const user = require('../models/UsersModel');
const wall = require('../models/WallModel');
const task = require('../models/TasksModel');
//Add new task to wall
async function addWall(user_id, task_id){
    try{
        let isExist = await wall.findOne({"user_id" : user_id},"_id");
        if(!isExist){
            let result = await wall.create({"user_id" : user_id, "wall" : {"task_id" : task_id}});
            if(result){
                return {"success" : true};
            }else{
                return {"success" : false};
            }
        }else{

            let isInWall = await wall.findOne({"user_id" : user_id, "wall.task_id" : task_id}, "_id");
            if(isInWall){
                console.log("Already");
                return {"success" : false, "errors" : {"message" : "Already in wall"}};
            }
               
            else{
                let result = await wall.update({"user_id" : user_id}, {
                    $push : {
                        "wall" : {
                            $each : [{"task_id" : task_id}],
                            $position : 0
                        }
                    }
                });
                if(result){
                    return {"success" : true};
                }else{
                    return {"success" : false};
                }
            }

        }
    }catch(e){
        throw(e);
    }
}

// Get top number news
async function getWallData(user_id, number_task, skip){
    let taskwall = await wall.findOne({"user_id" : user_id}, {
        "wall" : {
            $slice : [skip,number_task]
        }
    });
    let task_id = taskwall.wall;
    let list_task_id = [];
    for(let i in task_id){
        list_task_id.push(task_id[i].task_id)
    }
    let result = await task.find({"_id": {
        $in : list_task_id
    }}, ["_id", "task_title", "task_description", "created_time","location", "price.price_type", "price.floor_price", "price.ceiling_price"]);
    if(result){
        return {"success" : true, "data" : result};
    }else{
        return {"success" : false, "data" : {}};
    }
}

//getWallData("5f15dee66d224e19dcbf6bbf",2,0);
//addWall("5f15dee66d224e19dcbf6bbf","5f1c5da395199238c4282654")
module.exports.addWall = addWall;
module.exports.getWallData = getWallData;