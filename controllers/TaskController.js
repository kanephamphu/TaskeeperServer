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

//Get tasks by number of tasks
async function getTasks(number_task,skip){
    try{
        let listTasks = await task.find({}, ["_id", "task_title", "task_description", "created_time","location", "price.price_type", "price.floor_price", "price.ceiling_price"],{limit : number_task, skip: skip}).exec();
        return listTasks;
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

// Employee apply to the task
async function addApplicationJob(user_id,task_id, introduction,floor_price,ceiling_price){
    try{
        let isApplied = await task.findOne({
            "_id" : task_id,
            "task_candidate_apply_list._id_candidate" : user_id
        });
        console.log(isApplied)
        if(!isApplied){
            let applyTask = await task.update({"_id" : task_id},
            {
                $push : {
                    "task_candidate_apply_list" : {
                        "_id_candidate" : user_id,
                        "introduction" : introduction,
                        "floor_price" : floor_price,
                        "ceiling_price" : ceiling_price
                    }
                }
            });
            console.log(applyTask)
            if(applyTask){
                return {"success" : true };
            }
            return {"success" : false, "errors" : {"message" : "Undefined errors"}};
        }else{
            return {"success" : false, "errors" : {"message" : "Already applied"}};
        }
        
    }catch(e){
        console.log(e);
        throw(e);
    }
}

// Delete application of job
async function deleteApplicationJob(user_id, task_id){
    try{
        let isApplied = task.findOne({
            "_id" : task_id,
            "task_candidate_apply_list._id_candidate" : user_id
        }).exec();
        if(!isApplied){
            let applyTask = task.update({"_id" : task_id},
            {
                $pull : {
                    "task_candidate_apply_list" : {
                        "_id_candidate" : user_id
                    }
                }
            }).exec();

            if(applyTask){
                return {"success" : true };
            }
            return {"success" : false, "errors" : {"message" : "Undefined errors"}};
        }else{
            return {"success" : false, "errors" : {"message" : "Did n't apply"}};
        }
    }catch(e){
        console.log(e);
        throw(e);
    }
}

// Update job application of job
async function updateApplicationJob(user_id,task_id, introduction,floor_price,ceiling_price){
    try{
        let isApplied = task.findOne({
            "_id" : task_id,
            "task_candidate_apply_list._id_candidate" : user_id
        }).exec();
        if(isApplied){
            let applyTask = task.update({
                "_id" : task_id,
                "task_candidate_apply_list._id_candidate" : user_id},
            {
                $set : {
                    "task_candidate_apply_list" : {
                        "_id_candidate" : user_id,
                        "introduction" : introduction,
                        "floor_price" : floor_price,
                        "ceiling_price" : ceiling_price
                    }
                }
            }).exec();

            if(applyTask){
                return {"success" : true };
            }
            return {"success" : false, "errors" : {"message" : "Undefined errors"}};
        }else{
            return {"success" : false, "errors" : {"message" : "Already applied"}};
        }
        
    }catch(e){
        console.log(e);
        throw(e);
    }
}

// Get job applicant list
async function getApplyList(task_id){
    let candidate_apply_list = await task.findOne({
        "_id" : task_id
    },["task_candidate_apply_list"]);
    if(candidate_apply_list){
        return {"success" : true, "data" : candidate_apply_list}
    }else{
        return {"success" : false}
    }   
}

// Get list job which a client applied
async function getAppliedJobs(user_id){
    let listJobs = await task.find({
        "task_candidate_apply_list._id_candidate" : user_id
    },["task_title", "task_type", "position"]).exec();
    if(listJobs){
        return {"success" : true, "data" : listJobs}
    }else{
        return {"success" : false}
    }
}

async function testviewJob(){
    //var result = await viewTaskDetail("5f1c581dcde7010774853652");
    //var result = await viewTasks(10, 10);
    //var result = await getAppliedJobs("5f19a81b1cc2f7000458a566");
    //var result = await addApplicationJob("5f17ea80959405207c09f752","5f1c581dcde7010774853652", "Hddd",34, 65);
    console.log(result);
}


//testviewJob();
module.exports.getAppliedJobs = getAppliedJobs;
module.exports.getApplyList = getApplyList;
module.exports.updateApplicationJob = updateApplicationJob;
module.exports.deleteApplicationJob = deleteApplicationJob;
module.exports.addApplicationJob = addApplicationJob;
module.exports.viewTaskDetail = viewTaskDetail;
module.exports.viewTaskHistoryList = viewTaskHistoryList;
module.exports.addFreelanceTask = addFreelanceTask;
module.exports.addTask = addTask;
module.exports.getTasks = getTasks;