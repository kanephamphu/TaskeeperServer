var CryptoJS = require("crypto-js");
var user = require('../models/UsersModel');
var group = require('../models/GroupUserModel');
require('dotenv').config()

//encrypt text to sha256
function encrypt(text) {
    return CryptoJS.HmacSHA256(text,process.env.encrypt_secret_key).toString(CryptoJS.enc.Hex);
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

//Check: is group exists
async function isGroupExist(_id) {
    try{
        const result=await group.findOne(
            {
                "_id" : _id
            },'_id')
        var kq=false;
        if(result!=null){
            kq=true;
        }
        return kq;
    }catch(err){
        throw(err);
    } 
};

//Check : is already in group. If already in group return true else false
async function isAlreadyGroup(_id,_id_group) {
    try{
        const result=await group.find(
            {
                "_id" : _id
            },'group')
        if(result.indexOf(_id_group)!==-1){
            return false;
        }else{
            return true;
        }
    }catch(err){
        throw(err);
    }
};

module.exports.isAlreadyGroup = isAlreadyGroup;
module.exports.isGroupExist = isGroupExist;
module.exports.encrypt = encrypt;
module.exports.isEmailExist=  isEmailExist;
module.exports.isNumberPhoneExist=  isNumberPhoneExist;

