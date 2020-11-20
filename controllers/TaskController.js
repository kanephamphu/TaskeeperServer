var task = require('../models/TasksModel');
const user = require('../models/UsersModel');
const isValidDay = require('is-valid-date');
const { findOne } = require('../models/UsersModel');
require('dotenv').config();


//Add Freelancer Task
async function addFreelanceTask(task_title,task_description, task_description, task_owner_first_name, 
    task_owner_last_name, task_owner_avatar,task_type,task_owner_id,tags,floor_price,ceiling_price,location,
    price_type,languages,industry, endDay, endMonth, endYear) {
    try{
        if(task_type=='freelance'){
            if(endDay != null && endMonth != null && endYear != null){
                let validDay = isValidDay(endDay+'/'+endMonth+'/'+endYear);
                if(validDay){
                    var taskDocs = {
                        "task_title" : task_title,
                        "task_description" : task_description,
                        "task_owner_id" : task_owner_id,
                        "tags" : tags,
                        "price.price_type" : price_type,
                        "task_type" : task_type,
                        "task_owner_first_name" : task_owner_first_name,
                        "task_owner_last_name" : task_owner_last_name,
                        "task_owner_avatar" : task_owner_avatar,
                        "price.floor_price" : floor_price,
                        "price.ceiling_price" : ceiling_price,
                        "location" : location,
                        "languages" : languages,
                        "industry" : industry,
                        "skills" : skills,
                        "end_day" : endDay,
                        "end_month" : endMonth,
                        "end_year" : endYear
                    };
                    var result = await task.create(taskDocs);
                }else{
                    return {"success" : false, "errors" : {"rule" : "date", "message" : "Date is invalid"}};
                }
            }else{
                var taskDocs = {
                    "task_title" : task_title,
                    "task_description" : task_description,
                    "task_owner_id" : task_owner_id,
                    "tags" : tags,
                    "price.price_type" : price_type,
                    "task_type" : task_type,
                    "task_owner_first_name" : task_owner_first_name,
                    "task_owner_last_name" : task_owner_last_name,
                    "task_owner_avatar" : task_owner_avatar,
                    "price.floor_price" : floor_price,
                    "price.ceiling_price" : ceiling_price,
                    "location" : location,
                    "languages" : languages,
                    "industry" : industry,
                    "skills" : skills
                };
                var result = await task.create(taskDocs);
            }
            if(result){
                return {"success" : true, "data" : result};
            }else{
                return {"success" : false};
            }
        }
    }catch(e){
        console.log(e);
        throw(e);
    }
}

//Add Freelancer Task
async function addTask(task_title,task_description, task_requirement, task_owner_first_name, task_owner_last_name, 
    task_owner_avatar,task_type,task_owner_id,tags,floor_price,ceiling_price,location,price_type, 
    languages, industry, skills, endDay, endMonth, endYear, working_time) {
    try{
        if(endDay != null && endMonth != null && endYear != null){
            let validDay = isValidDay(endDay+'/'+endMonth+'/'+endYear);
            if(validDay){
                var taskDocs = {
                    "task_title" : task_title,
                    "task_description" : task_description,
                    "task_owner_id" : task_owner_id,
                    "tags" : tags,
                    "price.price_type" : price_type,
                    "task_type" : task_type,
                    "task_owner_first_name" : task_owner_first_name,
                    "task_owner_last_name" : task_owner_last_name,
                    "task_owner_avatar" : task_owner_avatar,
                    "price.floor_price" : floor_price,
                    "price.ceiling_price" : ceiling_price,
                    "location" : location,
                    "languages" : languages,
                    "industry" : industry,
                    "skills" : skills,
                    "end_day" : endDay,
                    "end_month" : endMonth,
                    "end_year" : endYear,
                    "working_time" : working_time
                };
                var result = await task.create(taskDocs);
                if(result){
                    return {"success" : true, "data" : result};
                }else{
                    return {"success" : false};
                }
            }else{
                return {"success" : false, "errors" : "name" [{"rule" : "date", "message" : "Date is invalid"}]};
            }
        }else{
            var taskDocs = {
                "task_title" : task_title,
                "task_description" : task_description,
                "task_requirement" : task_requirement,
                "task_owner_id" : task_owner_id,
                "tags" : tags,
                "price.price_type" : price_type,
                "task_type" : task_type,
                "price.floor_price" : floor_price,
                "price.ceiling_price" : ceiling_price,
                "location" : location,
                "task_owner_first_name" : task_owner_first_name,
                "task_owner_last_name" : task_owner_last_name,
                "task_owner_avatar" : task_owner_avatar,
                "languages" : languages,
                "industry" : industry,
                "skills" : skills,
                "working_time" : working_time
            };
            var result = await task.create(taskDocs);
            if(result){
                return {"success" : true, "data" : result};
            }else{
                return {"success" : false};
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
async function addApplicationJob(user_id,task_id, introduction,price){
    try{
        let isApplied = await task.findOne({
            "_id" : task_id,
            "task_candidate_apply_list.candidate_id" : user_id
        },"_id");

        if(isApplied == null){
            let applyTask = await task.update({"_id" : task_id},
            {
                $push : {
                    "task_candidate_apply_list" : {
                        "candidate_id" : user_id,
                        "introduction" : introduction,
                        "price" : price
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
        let isApplied = await task.findOne({
            "_id" : task_id,
            "task_candidate_apply_list.candidate_id" : user_id
        });
        
        if(isApplied){
            let deleteTask = await task.update({"_id" : task_id},
            {
                $pull : {
                    "task_candidate_apply_list" : {
                        "candidate_id" : user_id
                    }
                }
            });

            if(deleteTask){
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
async function updateApplicationJob(user_id,task_id, introduction,price){
    try{
        let isApplied = task.findOne({
            "_id" : task_id,
            "task_candidate_apply_list.candidate_id" : user_id
        }).exec();
        if(isApplied){
            let applyTask = task.update({
                "_id" : task_id,
                "task_candidate_apply_list.candidate_id" : user_id},
            {
                $set : {
                    "task_candidate_apply_list" : {
                        "candidate_id" : user_id,
                        "introduction" : introduction,
                        "price" : price
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

// Get job saved detail
async function getSavedDetail(task_id){
    let detail = await task.findOne({"_id" : task_id}, ["task_owner_id","task_owner_avatar", "task_owner_first_name", "task_owner_last_name", "task_title"]);
    increaseImpression(task_id);
    return detail;
}

// Task increase impression
async function increaseImpression(task_id){
    try {
        let result = await task.updateOne({"_id" : task_id}, {
            $inc : {impression : 1}
        });
        if(result){
            return {"success" : true};
        }else{
            return {"success" : false};
        }
    }catch(e){
        return {"success" : false};
    }
}
//increaseImpression("5f1c581dcde7010774853652");
// Get list job which a client applied
async function getAppliedJobs(user_id){
    let listJobs = await task.find({
        "task_candidate_apply_list.candidate_id" : user_id
    },["task_title", "task_type", "position"]).exec();
    if(listJobs){
        return {"success" : true, "data" : listJobs}
    }else{
        return {"success" : false}
    }
}

// Set task done 
async function setTaskDone(task_owner_id, task_id){
    let result = task.updateOne({"_id" : task_id, "task_owner_id" : task_owner_id}, {"isDone" : true});
    if(result){
        return {"sucess" : true}
    }else{
        return {"success" : false}
    }
}

// Get task manage
async function getTaskManage(task_owner_id, number_task, skip){
    try{
        let result = await task.find({"task_owner_id" : task_owner_id}, ["task_title", "task_type", "created_time"],{limit : number_task, skip: skip}).sort({"created_time" : -1});
        if(result)
            return {"success" : true, "data" : result}
        else
            return {"success" : false}
    }catch(e){
        return {"success" : false}
    }
}

// Client send approve work 
async function approveEmployeeToWork(task_owner_id, task_id, employee_id){
    let pricelist = await task.findOne({"_id" : task_id, "task_owner_id" : task_owner_id, "task_candidate_apply_list.candidate_id" : employee_id}, ["task_candidate_apply_list.price"]);
    let price = pricelist.task_candidate_apply_list[0].price;
    let result = await task.updateOne({"_id" : task_id, "task_owner_id" : task_owner_id, "task_candidate_list.candidate_id" : employee_id},
    {
        $push : {
            "work_employee_list" : {
                "employee_id" : employee_id,
                "price" : price
            }
        }
    });
    if(result){
        return {"success" : true};
    }else{
        return {"success" : false};
    }
}

// Get task owner id
async function getTaskOwnerId(task_id){
    let owner_id = await task.findOne({
        "_id" : task_id
    },["task_owner_id"]).exec();
    if(owner_id){
        return owner_id.task_owner_id;
    }else{
        return null
    }
}

async function testviewJob(){
    var result =  await addFreelanceTask("Tuyển thành viên tập đoàn đa cấp ","Lương tháng 7 tỉ", "Ti", "Phu",
    "sdsdf",'freelance', "123", ["Lập Trình"], 76,445,"Vl", 'unextract');
    //var result = await viewTaskDetail("5f1c581dcde7010774853652");
    //var result = await viewTasks(10, 10);
    //var result = await getAppliedJobs("5f19a81b1cc2f7000458a566");
    //var result = await addApplicationJob("5f2ac25e8e857e00041dc2b8","5f1c581dcde7010774853652", "Hddd",34, 65);
    console.log(result);
}

// Get list employee 
async function getWorkEmployee(task_owner_id, task_id){
    try{
        let employeeId = await task.findOne({"_id" : task_id, "task_owner_id" : task_owner_id},["work_employee_list"]);
        if(employeeId){
            console.log(employeeId.work_employee_list)
            let result = await user.find({"_id" : {$in : employeeId.work_employee_list}}, ["_id", "first_name", "last_name", "votes.vote_count", "votes.vote_point_average"]);
            if(result){
                console.log(result);
                return {"success" : true, "data" : result};
            }else{
                return {"success" : false};
            }
            
        }else{

        }
    }catch(e){
        return {"success" : false}
    }
}
//getWorkEmployee("5fb378656eae3400041711a3","5fb425c241900d0004b6ee5c");
//deleteApplicationJob("5f2546def9ca2b000466c467","5f3629ac1e62e1000425540c")
//testviewJob();

module.exports.getTaskOwnerId = getTaskOwnerId;
module.exports.getSavedDetail = getSavedDetail; 
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
module.exports.setTaskDone = setTaskDone;
module.exports.approveEmployeeToWork = approveEmployeeToWork;
module.exports.getTaskManage = getTaskManage;
