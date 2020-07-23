var validator = require('validator');
var checker= require('../controllers/checker');
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

module.exports.checkLogin= checkLogin;