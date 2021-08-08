//worker related tasks


//Dependencies
const path = require('path');
const fs = require('fs');
const _data = require('./data');
const https = require('https');
const http = require('http');
const helpers = require('./helpers');
const url = require('url');
const _logs = require('./logs')

//worker object
let workers = {};

//Init function
workers.init = function(){
    //execute all the checks 
    workers.gatherChecks();

    //call loop to execute checks on their own
    workers.loop();

    //compress all the logs immediatly
    workers.rotateLogs();

    //Call compression loop to compress logs later on
    workers.logRotationLoop();
};



/*
Checks related functions
*/

//timer to execute worker-process one per minute
workers.loop = function(){
    setInterval(function(){
        workers.gatherChecks();
    },1000 * 60);
};

//lookup all checks, get their data and send to validator
workers.gatherChecks = function(){
    //get all the checks in the system
    _data.list('checks',function(err,checks){
        if(!err && checks && checks.length > 0){
            checks.forEach(function(check){
                //Read in the check data
                _data.read('checks',check,function(err,originalCheckData){
                    if(!err && originalCheckData){
                        //Pass data to check validator
                        workers.validateCheckData(originalCheckData);
                    }else{
                        console.log('Error: Reading while reading one of the checks data');
                    }
                });
            });
        } else {
            console.log('Error: Could not find checks to process');
        }
    });
};


// check the check-data
workers.validateCheckData = function(originalCheckData){
    originalCheckData = typeof(originalCheckData) == 'object' && originalCheckData !== null ? originalCheckData : {};
    originalCheckData.id = typeof(originalCheckData.id) == 'string' && originalCheckData.id.trim().length == 20 ? originalCheckData.id.trim() : false;
    originalCheckData.userPhone = typeof(originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.trim().length == 10 ? originalCheckData.userPhone.trim() : false;
    originalCheckData.protocol = typeof(originalCheckData.protocol) == 'string' && ['http','https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
    originalCheckData.url = typeof(originalCheckData.url) == 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false;
    originalCheckData.method = typeof(originalCheckData.method) == 'string' && ['get','post','put','delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;
    originalCheckData.successCodes = typeof(originalCheckData.successCodes) == 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;
    originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) == 'number' &&  originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <=5 ? originalCheckData.timeoutSeconds : false;

    //set the keys that may not be set (if workers have never seen this check)
    originalCheckData.state = typeof(originalCheckData.state) == 'string' && ['up','down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';
    originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) == 'number' &&  originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;

    //pass data if check pass validation
    if(originalCheckData.id &&
        originalCheckData.userPhone &&
        originalCheckData.protocol && 
        originalCheckData.url &&
        originalCheckData.method && 
        originalCheckData.successCodes && 
        originalCheckData.timeoutSeconds){

            workers.performCheck(originalCheckData);

        } else {
            console.log('Error: One of the checks is not properly formatted');
        }
};


//perform the check, send originalCheckdata and outcome to the next process
workers.performCheck = function(originalCheckData){
    //prepare initial check outcome
    let checkOutcome = {
        'error': false,
        'responseCode': false,
    };

    //mark that outcome has not been sent yet
    let outcomeSent = false;

    //parse hostname and path from originalCheckData
    let parsedUrl = url.parse(originalCheckData.protocol+'://'+originalCheckData.url,true);
    let hostname = parsedUrl.hostname;
    let path = parsedUrl.path;

    //construct request
    let requestDetails = {
        'protocol': originalCheckData.protocol+':',
        'hostname': hostname,
        'method': originalCheckData.method.toUpperCase(),
        'path': path,
        'timeout': originalCheckData.timeoutSeconds * 1000
    };

    //instantiate request object (http or https)
    let _moduleToUse = originalCheckData.protocol == 'http' ? http : https;
    let req = _moduleToUse.request(requestDetails,function(res){
        //grab the status of the sent request
        let status = res.statusCode;

        //update check outcome and pass data along
        checkOutcome.responseCode = status;
        if(!outcomeSent){
            workers.processCheckOutcome(originalCheckData,checkOutcome);
            outcomeSent = true;
        }
    });

    //bind to the error so it doesnt get thrown
    req.on('error',function(e){
        //update the checkoutcome and pass data along
        checkOutcome.error = {
            'error': true,
            'value': e
        };
        if(!outcomeSent){
            workers.processCheckOutcome(originalCheckData,checkOutcome);
            outcomeSent = true;
        }
    });


    //bind to the timeout event
    req.on('timeout',function(e){
        //update the checkoutcome and pass data along
        checkOutcome.error = {
            'error': true,
            'value': 'timeout'
        };
        if(!outcomeSent){
            workers.processCheckOutcome(originalCheckData,checkOutcome);
            outcomeSent = true;
        }
    });


    //end request
    req.end();

};


//process check outcome and update check data, trigger alert to user if needed
//special logic for check that has never been tested (alert is not created)

workers.processCheckOutcome = function(originalCheckData,checkOutcome){
    // Decide if the check is considered up or down
    let state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';

    //decide if alert is needed
    let alertWarranted = originalCheckData.lastChecked && originalCheckData.state !== state ? true : false;
    
    //log the outcome
    let timeOfCheck = Date.now();
    workers.log(originalCheckData,checkOutcome,state,alertWarranted,timeOfCheck);

    //update check data
    let newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = timeOfCheck;

    //save the updates
    _data.update('checks',newCheckData.id,newCheckData,function(err){
        if(!err){
            //send check data to next phase if needed
            if(alertWarranted){
                workers.alertUserToStatusChange(newCheckData);
            } else {
                console.log('Check outcome has not changed, not alert needed');
            }
        }else{ 
            console.log('Error trying to save updates to one of the checks');
        }
    });
};

//Alert the user if there is a change in their check status
workers.alertUserToStatusChange = function(newCheckData){
    let msg = 'Alert: Your check for '+newCheckData.method.toUpperCase()+ ' ' + newCheckData.protocol+'://'+newCheckData.url+ ' is currently ' + newCheckData.state;

    helpers.sendTwilioSms(newCheckData.userPhone,msg,function(err){
        if(!err){
            console.log('Success: User was alerted to a status change in their check via sms: ', msg);
        } else {
            console.log('Error: Could not send sms alert to user who had a state change in their check');
        }
    });


};




/*
Log related functions
*/

//timer to execute the log-rotation process once per day
workers.logRotationLoop = function(){
    setInterval(function(){
        workers.rotateLogs();
    },1000 * 60 * 60 * 24);
};

//function to log data to files
workers.log = function(originalCheckData,checkOutcome,state,alertWarranted,timeOfCheck){
    //form log data
    let logData = {
        'check': originalCheckData,
        'outcome': checkOutcome,
        'state':state,
        'alert':alertWarranted,
        'time':timeOfCheck
    };

    //convert data to a string
    let logString = JSON.stringify(logData);

    //Determine name of log file
    var logFileName = originalCheckData.id;

    //Append log string to file
    _logs.append(logFileName,logString,function(err){
        if(!err){
            console.log('Logging to file succeded');
        }else{
            console.log('Logging to file failed');
        }
    });
};


//rotate (compress) log files
workers.rotateLogs = function(){
    //list non compressed log files in logs folder
    _logs.list(false,function(err,logs){
        if(!err && logs && logs.length > 0){
            logs.forEach(function(logName){
                //compress data to different file
                let logId = logName.replace('.log','');
                let newFileId = logId+'-'+Date.now();
                _logs.compress(logId,newFileId,function(err){
                    if(!err){
                        //truncate log (empty the file)
                        _logs.truncate(logId,function(err){
                            if(!err){
                                console.log('Sucess truncating log file');
                            } else {
                                console.log('Error truncating log file');
                            }
                        });
                    } else {
                        console.log('Error compressing one of the log files',err);
                    }
                });
            });
        } else {
            console.log('Error: Could not find any logs to rotate');
        }
    });
};


//export module
module.exports = workers;