var validator = require('validator');
var checker= require('./Check');
const user = require('../models/UsersModel');
const { mode } = require('crypto-js');

//Check login
async function checkLoginQuery(loginquery){
    if(validator.isEmail(loginquery) || validator.isMobilePhone(loginquery)){
        return true;
    }else{
        return false;
    }
}
async function checkLogin(loginquery, passwordquery){
    const password= await user.findOne({
        $or: [{"email.current_email" : loginquery},
        {"phone_number.current_phone_number": loginquery}, {"login_information.username": loginquery}]},
        "login_information.password");
        if(password != null) {
            if(password.login_information.password==checker.encrypt(passwordquery)){
                return 'success';
            }else{
                return {"password": {"message": "The password is not matched","rule": 'wrong-password'}};
            }
        }else{
            return {"loginquery": {"message": "Can n't found the email","rule": 'not-found-email'}};
        }
        
}
//Register new account
async function register(first_name, last_name, email, phone_number, password, day, month, year) {
        if(await checker.isEmailExist(email)==false){
                    if(await checker.isNumberPhoneExist(phone_number) == false){
                        var userdocs = {
                            "first_name": first_name,
                            "last_name": last_name,
                            "login_information.password": checker.encrypt(password),
                            "phone_number.current_phone_number": phone_number,
                            "email.current_email": email
                        }
                        
                        const result = user.create(userdocs);
                        
                        if(result)
                            return {"success" : true};
                        else
                            return {"success" : false, "errors" : {message : "Cann't register"}};
                    }else{
                        return {"success" : false, "errors" : {"message" : "Phone number already exists", "rule" : "phoneNumber"}};
                    }
            }else{
                return {"success" : false, "errors" : {message : "Email already exists", "rule" : "email"}};
            }
}
//Get Group User 
async function getGroupUser(id) {
    try{
        
    }catch(e){
        console.log(e);
        throw(e);
    }
}

//Get ID by email or phone number or username
async function getUserID(loginquery){
    try{
        var id = await user.findOne(
            {$or: [{"email.current_email" : loginquery}, {"phone_number.current_phone_number": loginquery}, {"login_information.username": loginquery}]}
            ,"_id");
        return id._id;
    }catch(e){
        console.log(e);
        throw(e);
    }
}

//Get group by ID
async function  getGroup(_id) {
    try{
        var group = await user.findOne({"_id": _id},"group");
        return group.group;
    }catch(e){
        console.log(e);
        throw(e);
    }
}
//Get function by ID
async function  getFunction(_id) {
    try{
        var group = await user.findOne({"_id": _id},"function");
        return group.function;
    }catch(e){
        console.log(e);
        throw(e);
    }
}

//Get Information By ID
async function getInformation(_id){
    try{
        var information = await user.findOne({"_id":_id},["login_information.username"
        ,"email.current_email","phone_number.current_phone_number","first_name","last_name"]);
        return information;
    }catch(e){
        console.log(e);
        throw(e);
    }
}

//Change password 
async function changePassword(_id, password){
    try{
        var result = await user.updateOne({"_id":_id}, {"login_information.password" : checker.encrypt(password)});
        if(result.n>0){
            return {"success" : true};
        }else{
            return {"success" : false};
        }
    }catch(e){
        console.log(e);
        throw(e);
    }
}

//Add group to user
async function addNewGroup(_id,_groupid) {
    try{
        var result = await checker.isGroupExist(_groupid);
        if(result){
            if(await checker.isAlreadyGroup(_id,_groupid)==false){
                var result=await user.findOne(
                    {
                        "_id" : _id
                    },"group");
                result=result.group;
                result.push(_groupid);
                var result1 = await user.update({"_id": _id},{"group": result});
                if(result1)
                    return 'success';
                else
                    return 'failed';

            }else{
                return 'already-in-group';
            }
        }else
            return 'group-not-exists';
    }catch(e){
        throw(e);
    }
}

//Add new working detail
async function addNewWorkingInformation(_id,specialize,level) {
    try{
        var result=await user.findOne(
            {
                "_id" : _id
            },"working_information.working_details");
        result = result.working_information.working_details;
        result.push({"specialize" : specialize, "level" : level});
        console.log(result);
        var result1 = await user.update({"_id": _id},{"working_information.working_details": result});
        if(result1)
            return {"success" : true};
        else
            return {"success" : true, "errors" : {"message" : "Undefined errors"}};
    }catch(e){
        throw(e);
    }
}

//Edit working detail
async function editWorkingInformation(_id, workingid, specialize, level){
    try{
        var result = await user.findOne(
            {
                "_id" : _id
            }, "working_information.working_details"
        );
        result = result.working_information.working_details;
        
    }catch(e){
        throw(e);
    }
}
//Add new education detail
async function addNewEducationInformation(_id,education_name,education_description) {
    try{
        var result=await user.findOne(
            {
                "_id" : _id
            },"education_information.education");
            console.log(result);
        result = result.education_information;
        console.log(result);
        result.push({"education_name" : education_name, "education_description" : education_description});
        console.log(result);
        var result1 = await user.update({"_id": _id},{"education_information": result});
        if(result1)
            return {"success" : true};
        else
            return {"success" : true, "errors" : {"message" : "Undefined errors"}};
    }catch(e){
        console.log(e);
        throw(e);
    }
}


//Set active account
async function setActive(_id) {
    try{
        var result = await user.update({"_id" : _id},{"status" : "isActive"});
        if(result)
            return {"success" : true};
        else
            return {"success" : true, "errors" : {"message" : "Undefined errors"}};
    }catch(e){
        console.log(e);
        throw(e);
    }
}

//Set suspended account
async function setSuspended(_id) {
    try{
        var result = await user.update({"_id" : _id},{"status" : "suspended"});
        if(result)
            return {"success" : true};
        else
            return {"success" : true, "errors" : {"message" : "Undefined errors"}};
    }catch(e){
        console.log(e);
        throw(e);
    }
}

//Get all detail of user
async function getAllDetail(_id){
    try{
        let detail = await user.findOne({"_id": _id}, ["avatar","first_name","last_name","gender",
    "description", "website","day_of_birth","month_of_birth","year_of_birth","nationality",
    "email.current_email","phone_number.current_phone_number","working_information","education_information",
    "votes"]).exec();
        return detail;
    }catch(e){
        console.log(e);
        throw(e);
    }
}

async function testviewJob(){
    var result = await getAllDetail("5f2546def9ca2b000466c467");
    console.log(result);
}

module.exports.getAllDetail = getAllDetail;
module.exports.setActive = setActive;
module.exports.setSuspended = setSuspended;
module.exports.addNewWorkingInformation = addNewWorkingInformation;
module.exports.addNewEducationInformation = addNewEducationInformation;
module.exports.addNewGroup = addNewGroup;
module.exports.changePassword = changePassword;
module.exports.getInformation = getInformation;
module.exports.getFunction = getFunction;
module.exports.getGroup = getGroup;
module.exports.getUserID = getUserID;
module.exports.register=register;
module.exports.checkLogin= checkLogin;
module.exports.checkLoginQuery = checkLoginQuery;