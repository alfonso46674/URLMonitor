// helper file for various tasks

//dependencies
const crypto = require('crypto')
const config = require('./config')
const querystring = require('querystring')
const https = require('https')
const path = require('path')
let fs = require('fs');

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


//sends sms via Twilio
helpers.sendTwilioSms = function(phone, msg, callback){
    //validate parameters
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;

    if(phone && msg){
        //configure request payload to send
        let payload = {
            'From': config.twilio.fromPhone,
            'To': '+52' + phone,
            'Body': msg
        };

        let stringPayload = querystring.stringify(payload);

        //configure request details
        let requestDetails = {
            'protocol':'https:',
            'hostname':'api.twilio.com',
            'method':'POST',
            'path':'/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
            'auth': config.twilio.accountSid+':'+config.twilio.authToken,
            'headers': {
                'Content-Type':'application/x-www-form-urlencoded',
                'Content-Length':Buffer.byteLength(stringPayload)
            }
        };

        //instantiate request object
        let req = https.request(requestDetails,function(res){
            //grab status of the sent request
            let status = res.statusCode;
            //return successfull callback
            if(status == 200 || status == 201){
                callback(false);
            } else {
                callback('Status code returned was '+status);
            }
        });

        
        //bind to error event so it doesnt get thrown
        req.on('error',function(e){
            callback(e);
        });

        //add payload to request
        req.write(stringPayload);

        //end the request (sends the request), when it comes back it will execute line 84 (https.request(requestDetails, etc....))
        req.end();

    }else {
        callback('Given parameters were missing or invalid');
    }
}


//Get the string content of a template
helpers.getTemplate = function(templateName,callback){
    templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
    if(templateName){
        let templatesDir = path.join(__dirname,'/../templates/');
        fs.readFile(templatesDir+templateName+'.html','utf8',function(err,str){
            if(!err && str && str.length > 0){
                callback(false,str);
            } else {
                callback('No template could be found');
            }
        })
    } else {
        callback('A valid template name was not specified');
    }
};

module.exports = helpers;