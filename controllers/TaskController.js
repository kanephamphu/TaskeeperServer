var task = require('../models/TasksModel');

//Add Freelancer Task
async function addTask(task_title,task_description,task_type,task_owner_id,tags,floor_price,ceiling_price,location,price_type) {
    try{
        if(task_type=='freelance'){
            var taskDocs = {
                "task_title" : task_title,
                "task_description" : task_description,
                "task_owner_id" : task_owner_id,
                "tags" : tags,
                "price.price_type" : price_type,
                "task_type" : task_type,
                "price.floor_price" : floor_price,
                "price.ceiling_price" : ceiling_price,
                "location" : location
            };
            var result = await task.create(taskDocs);
            if(result){
                return 'success';
            }else{
                return 'failed';
            }
        }
    }catch(e){
        console.log("e");
        throw(e);
    }
}

async function test() {
    var tags = [];
    tags.push('Lập Trình');
    var result = await addTask("Tuyển lập trình viên React Native", "Lập Trình Dự Án","freelance", "5f15dee66d224e19dcbf6bbf", tags, "500", "700", "Thanh An- Điện Hồng- Quảng Nam","unextract");
    console.log(result);  
}

//test();

module.exports.addTask = addTask;