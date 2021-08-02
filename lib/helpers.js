// helper file for various tasks

//dependencies
const crypto = require('crypto')
const config = require('./config')


let helpers = {};

//Create a SHA256 hash
helpers.hash = function(str){
    if(typeof(str) == 'string' && str.length > 0){
        let hash  = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};

//Parse a json string to an object in all cases without throwing
helpers.parseJsonToObject = function(str){
    try{
        let obj = JSON.parse(str);
        return obj;
    }catch(e){
        return {};
    }
}

//Create string of random alphanumeric characters with a given length
helpers.createRandomString = function(strLength){
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
    if(strLength){
        //Define possible characters that could go into a string
        let possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789';

        //start final string
        let str = '';

        for(let i = 0; i < strLength; i++){
            //get random character from possibleChars
            let randomChar = possibleChars.charAt(Math.floor(Math.random()*possibleChars.length));
            //append this character to final string
            str+=randomChar;
        }
        return str;
    }else{ 
        return false;
    }
}

module.exports = helpers;