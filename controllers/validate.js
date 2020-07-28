const {Validator } = require('node-input-validator');
let validateLogin = ()=>{
    return [
        check('username','username does not Empty').not().isEmpty(),
        check('password','password must more than 6 degits').isLength({min:6})
    ];
}

let validate = {
    validateLogin: validateLogin
};


module.exports ={validate};