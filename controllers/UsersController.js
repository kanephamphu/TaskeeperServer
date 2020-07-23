var validator = require('validator');
var checker= require('../controllers/Checker');
const user = require('../models/UsersModel');

//Check login
async function checkLogin(loginquery, passwordquery){
    if(validator.isEmail(loginquery) || validator.isMobilePhone(loginquery)){
        const password= await user.findOne({
            $or: [{"email.current_email" : loginquery},
            {"phone_number.current_phone_number": loginquery}, {"login_information.username": loginquery}]},"login_information.password");
        if(password==null){
            return 'not-found-login-query';
        }else{
            try{
                if(password.login_information.password==checker.encrypt(passwordquery)){
                    return 'success';
                }else{
                    return 'wrong-password';
                }
            }catch(e){
                console.log(e);
                throw(e);
            }
        }
    }else{
        return 'wrong-format';
    }
}
//Register new account
async function register(first_name, last_name, email, phone_number, password) {
    if(validator.isEmail(email)){
        if(await checker.isEmailExist(email)==false){
                if(validator.isMobilePhone(phone_number)){
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
                            return 'success';
                        else
                            return 'failed';
                    }else{
                        return 'phone-number-exists';
                    }
                }else{
                    return 'wrong-phone-number-format';
                }
            }else{
                return 'email-exists';
            }
    }else
    {
        return 'wrong-email-format';
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

//Get JWT Token Information By ID
async function getInformation(_id){
    try{
        var information = await user.findOne({"_id":_id},["login_information.username"
        ,"login_information.password","email.current_email","phone_number.current_phone_number"]);
        return information;
    }catch(e){
        console.log(e);
        throw(e);
    }
}

module.exports.getInformation = getInformation;
module.exports.getFunction = getFunction;
module.exports.getGroup = getGroup;
module.exports.getUserID = getUserID;
module.exports.register=register;
module.exports.checkLogin= checkLogin;