var CryptoJS = require("crypto-js");
var user = require('../models/UsersModel');
var config= require('../config/default.json');
const { resolve } = require("path");
const { nextTick } = require("process");
//encrypt text to sha256
function encrypt(text) {
    return CryptoJS.HmacSHA256(text,config.Checking.secret_key).toString(CryptoJS.enc.Hex);
}

//Check: is email is used
async function isEmailExist(email) {
    try{
        const result=await user.findOne(
            {
                "email.current_email" : email
            },'first_name')
        var kq=false;
        if(result!=null){
            kq=true;
        }
        return kq;
    }catch(err){
        throw(err);
    }
    
};

//Check: is Mobile phone
async function isNumberPhoneExist(phone_number) {
    try{
        const result=await user.findOne(
            {
                "phone_number.current_phone_number" : phone_number
            },'first_name')
        var kq=false;
        if(result!=null){
            kq=true;
        }
        return kq;
    }catch(err){
        throw(err);
    }
    
};

module.exports.encrypt = encrypt;
module.exports.isEmailExist=  isEmailExist;
module.exports.isNumberPhoneExist=  isNumberPhoneExist;

