var task = require('../models/TasksModel');
require('dotenv').config();
//Add Freelancer Task
async function addFreelanceTask(task_title,task_description,task_type,task_owner_id,tags,floor_price,ceiling_price,location,price_type,languages,industry) {
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
        console.log("loi")
        console.log(e);
        throw(e);
    }
}

//Add Freelancer Task
async function addTask(task_title,task_description,task_type,task_owner_id,tags,floor_price,ceiling_price,location,price_type) {
    try{
        if(task_type!='freelance'){
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
        console.log(e);
        throw(e);
    }
}

async function viewTasks(number_task,skip){
    try{

    }catch(e){
        console.log(e);
        throw(e);
    }
}

//View Job History
async function viewTaskHistoryList(employee_id,number_of_skip){
    try{
        //Job Finding Condition
        let condition = {
            "work_employee._id_employee": employee_id
        }
        let listJobs = await task.find(condition, ["_id", "task_owner_id", "task_title", "month_of_working_done", 
    "year_of_working_done", "votes.vote_point"], {skip: number_of_skip }).exec();
        return listJobs;
    }catch(e){
        console.log(e);
        throw(e);
    }
}

//View Task Detail
async function viewTaskDetail(task_id){
    try{
        let taskDetail = await task.findOne({"_id": task_id}).exec();
        return taskDetail;
    }catch(e){
        console.log(e);
        throw(e);
    }
}
async function test() {
    var tags = [];
    tags.push('Lập Trình');
    var result = await addTask("Tuyển lập trình viên React Native", "Lập Trình Dự Án","freelance", "5f15dee66d224e19dcbf6bbf", tags, "500", "700", "Thanh An- Điện Hồng- Quảng Nam","unextract");
    console.log(result);  
}

async function testviewJob(){
    var result = await viewTaskDetail("5f1c581dcde7010774853652");
    console.log(result);
}


module.exports.viewTaskDetail = viewTaskDetail;
module.exports.viewTaskHistoryList = viewTaskHistoryList;
module.exports.addFreelanceTask = addFreelanceTask;
module.exports.addTask = addTask;