const wall = require('../models/WallModel');

//Add new task to wall
async function addWall(user_id, task_id){
    try{
        let isExist = await wall.findOne({"user_id" : user_id});
        if(!isExist){
            let result = await wall.create({"user_id" : user_id, "wall.task_id" : task_id});
            if(result){
                return {"success" : true};
            }else{
                return {"success" : false};
            }
        }else{
            let result = await wall.update({"user_id" : user_id}, {
                $push : {
                    "wall" : {
                        "task_id" : task_id
                    }
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

module.exports.addWall = addWall;