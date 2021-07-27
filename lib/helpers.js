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

module.exports = helpers;