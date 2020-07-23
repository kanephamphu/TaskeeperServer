var validator = require('validator');
var checker= require('../controllers/checker');
const user = require('../models/UsersModel');

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

module.exports.register=register;