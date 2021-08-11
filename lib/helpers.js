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
helpers.getTemplate = function(templateName,data,callback){
    templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
    data = typeof(data) == 'object' && data !== null ? data : {};
    
    if(templateName){
        let templatesDir = path.join(__dirname,'/../templates/');
        fs.readFile(templatesDir+templateName+'.html','utf8',function(err,str){
            if(!err && str && str.length > 0){
                //do interpolation on the string 
                let finalString = helpers.interpolate(str,data);
                callback(false,finalString);
            } else {
                callback('No template could be found');
            }
        })
    } else {
        callback('A valid template name was not specified');
    }
};

//Add universal header and footer to a string, and pass data object to header and footer for interpolation
helpers.addUniversalTemplates = function(str,data,callback){
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data !== null ? data : {};

    //get header
    helpers.getTemplate('_header',data,function(err,headerString){
        if(!err && headerString){
            //Get footer
            helpers.getTemplate('_footer',data,function(err,footerString){
                if(!err && footerString){
                    // Add all the strings together
                    let fullString = headerString + str + footerString;
                    callback(false,fullString);
                }else {
                    callback('Could not find the footer template')
                }
            });
        } else {
            callback('Could not find the header template');
        }
    });
}


//Take given string and data object, and find or replace all the keys within it
helpers.interpolate = function(str,data){
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data !== null ? data : {};

    //Add template globals to data object, prepending key name with global
    for(let keyname in config.templateGlobals){
        if(config.templateGlobals.hasOwnProperty(keyname)){
            data['global.'+keyname] = config.templateGlobals[keyname];
        }
    }

    //for each key in data object, insert its value into the string at corresponding placeholder in html files
    for(let key in data){
        if(data.hasOwnProperty(key) && typeof(data[key] == 'string')){
            let replace = data[key];
            let find = '{'+key+'}';
            str = str.replace(find,replace);
        }
    }

    return str;
};

module.exports = helpers;