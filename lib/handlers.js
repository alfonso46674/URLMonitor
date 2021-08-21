//Request handlers

//dependencies
const _data = require('./data')
const helpers = require('./helpers')
const config = require('./config')

//Define handlers
let handlers = {};


/*
*
* HTML HANDLERS
*
*/

//Index handler
handlers.index = function(data,callback){
    //Reject any request that isnot a GET
    if(data.method.toLowerCase() == 'get'){

        //prepare data for interpolation
        let templateData = {
            'head.title' : 'Uptime Monitoring',
            'head.description' : 'Simple uptime monitoring for HTTP/HTTPS sites.',
            'body.class' : 'index'
        };

        // read in index template as string
        helpers.getTemplate('index',templateData,function(err,string){
            if(!err && string){
                // add universal header and footer
                helpers.addUniversalTemplates(string,templateData,function(err,str){
                    //return page as html
                    if(!err && str){
                        callback(200,str,'html');
                    } else {
                        callback(500,undefined,'html');
                    }
                });
            } else {
                callback(500,undefined,'html');
            }
        });
    } else {
        callback(405,undefined,'html');
    }
};

// create account
handlers.accountCreate = function(data,callback){
    //Reject any request that isnot a GET
    if(data.method.toLowerCase() == 'get'){

        //prepare data for interpolation
        let templateData = {
            'head.title' : 'Create an account',
            'head.description' : 'Signup is easy and only takes a few seconds.',
            'body.class' : 'accountCreate'
        };

        // read in index template as string
        helpers.getTemplate('accountCreate',templateData,function(err,string){
            if(!err && string){
                // add universal header and footer
                helpers.addUniversalTemplates(string,templateData,function(err,str){
                    //return page as html
                    if(!err && str){
                        callback(200,str,'html');
                    } else {
                        callback(500,undefined,'html');
                    }
                });
            } else {
                callback(500,undefined,'html');
            }
        });
    } else {
        callback(405,undefined,'html');
    }
};

// create new session
handlers.sessionCreate = function(data,callback){
    //Reject any request that isnot a GET
    if(data.method.toLowerCase() == 'get'){

        //prepare data for interpolation
        let templateData = {
            'head.title' : 'Login to your account',
            'head.description' : 'Please enter your phone number and password to acces your account.',
            'body.class' : 'sessionCreate'
        };

        // read in index template as string
        helpers.getTemplate('sessionCreate',templateData,function(err,string){
            if(!err && string){
                // add universal header and footer
                helpers.addUniversalTemplates(string,templateData,function(err,str){
                    //return page as html
                    if(!err && str){
                        callback(200,str,'html');
                    } else {
                        callback(500,undefined,'html');
                    }
                });
            } else {
                callback(500,undefined,'html');
            }
        });
    } else {
        callback(405,undefined,'html');
    }
};

// Session deleted
handlers.sessionDeleted = function(data,callback){
    //Reject any request that isnot a GET
    if(data.method.toLowerCase() == 'get'){

        //prepare data for interpolation
        let templateData = {
            'head.title' : 'Logged Out',
            'head.description' : 'You have been logged out from your account.',
            'body.class' : 'sessionDeleted'
        };

        // read in index template as string
        helpers.getTemplate('sessionDeleted',templateData,function(err,string){
            if(!err && string){
                // add universal header and footer
                helpers.addUniversalTemplates(string,templateData,function(err,str){
                    //return page as html
                    if(!err && str){
                        callback(200,str,'html');
                    } else {
                        callback(500,undefined,'html');
                    }
                });
            } else {
                callback(500,undefined,'html');
            }
        });
    } else {
        callback(405,undefined,'html');
    }
};

// Edit account
handlers.accountEdit = function(data,callback){
    //Reject any request that isnot a GET
    if(data.method.toLowerCase() == 'get'){

        //prepare data for interpolation
        let templateData = {
            'head.title' : 'Account Settings',
            'body.class' : 'accountEdit'
        };

        // read in index template as string
        helpers.getTemplate('accountEdit',templateData,function(err,string){
            if(!err && string){
                // add universal header and footer
                helpers.addUniversalTemplates(string,templateData,function(err,str){
                    //return page as html
                    if(!err && str){
                        callback(200,str,'html');
                    } else {
                        callback(500,undefined,'html');
                    }
                });
            } else {
                callback(500,undefined,'html');
            }
        });
    } else {
        callback(405,undefined,'html');
    }
};

// Account has been deleted
handlers.accountDeleted = function(data,callback){
    //Reject any request that isnot a GET
    if(data.method.toLowerCase() == 'get'){

        //prepare data for interpolation
        let templateData = {
            'head.title' : 'Account Deleted',
            'body.class' : 'accountDeleted',
            'head.description':'Your account has been deleted.'
        };

        // read in index template as string
        helpers.getTemplate('accountDeleted',templateData,function(err,string){
            if(!err && string){
                // add universal header and footer
                helpers.addUniversalTemplates(string,templateData,function(err,str){
                    //return page as html
                    if(!err && str){
                        callback(200,str,'html');
                    } else {
                        callback(500,undefined,'html');
                    }
                });
            } else {
                callback(500,undefined,'html');
            }
        });
    } else {
        callback(405,undefined,'html');
    }
};

//favicon
handlers.favicon = function(data,callback){
    if(data.method == 'get'){
        //read in the favicons data
        helpers.getStaticAsset('favicon.ico',function(err,data){
            if(!err && data){
                //callback the data
                callback(200,data,'favicon');
            } else {
                callback(500);
            }
        });
    } else {
        callback(405);
    }
};

// public assets
handlers.public = function(data,callback){
    if(data.method == 'get'){
        //get the filename being requested
        let trimmedAssetName = data.trimmedPath.replace('public/','').trim();
        if(trimmedAssetName.length > 0){
            //read in the assets data
            helpers.getStaticAsset(trimmedAssetName,function(err,data){
                if(!err && data){
                    //determine the content type (default to plain text)
                    let contentType = 'plain';

                    if(trimmedAssetName.indexOf('.css') > -1){
                        contentType = 'css';
                    }
                    
                    if(trimmedAssetName.indexOf('.png') > -1){
                        contentType = 'png';
                    }
                    if(trimmedAssetName.indexOf('.jpg') > -1){
                        contentType = 'jpg';
                    }
                    if(trimmedAssetName.indexOf('.ico') > -1){
                        contentType = 'favicon';
                    }
                    callback(200,data,contentType);
                }else{
                    callback(404);
                }
            });
        } else {
            callback(404);
        }
    } else {
        callback(405);
    }
};

/*
*
* JSON API HANDLERS
*
*/


//users handler
handlers.users = function(data,callback){
    let acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method.toLowerCase()) > -1){
        handlers._users[data.method.toLowerCase()](data,callback);
    } else {
        //return method not allowed (http response)
        callback(405);
    }
};

// container for the users submethod
handlers._users = {}

//Users post
//Required data: FirstName, lastName, phone, password, tosAgreement
handlers._users.post = function(data,callback){
    //check that required fields exist
    let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if(firstName && lastName && phone && password && tosAgreement){
        //check if user does not already exist
        _data.read('users',phone,function(err,data){
            if(err){
                //Hash the password
                let hashedPassword = helpers.hash(password);

                if(hashedPassword){
                    //create the user object
                    let userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword':hashedPassword,
                        'tosAgreement': true
                    };
                    
                    //store the user
                    _data.create('users',phone,userObject,function(err){
                        if(!err){
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500,{'Error':'Could not create the new user'})
                        }
                    });
                } else {
                    callback(500,{'Error':'Could not hash the user\'s password'})
                }
                

            } else {
                //user already exists
                callback(400,{'Error':'A user with that phone number already exists'});
            }
        })
    } else {
        console.log({"firstName":firstName,"lastName":lastName,"phone":phone,"password":password,"tos":tosAgreement});
        callback(400,{'Error':'Missing required fields'});
    }
};

//Users get
//Required data: phone
//Required header: valid token
handlers._users.get = function(data,callback){
    //Check that phone number is valid
    let phone = typeof(data.queryStringObject.get('phone')) == 'string' && data.queryStringObject.get('phone').trim().length == 10 ? data.queryStringObject.get('phone').trim() : false;
    if(phone){

        //get the token from the headers
        let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        //verify token is valid for the phone number
        handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
            if(tokenIsValid){
                //Search user
                _data.read('users',phone,function(err,data){
                    if (!err && data){
                        //remove hashed password
                        delete data['hashedPassword'];
                        callback(200,data);
                    }else {
                        callback(404);
                    }
                });
            } else{
                callback(403,{'Error':'Missing required token in header, or token is invalid'});
            }
        });
    } else {
        callback(400,{'Error':'Missing required field'});
    }
};

//Users put
//Required data: phone
//optional data: firstName, lastName, password (at least one)
//Required header: valid token
handlers._users.put = function(data,callback){  
    //check required phone field
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    
    //check optional fields
    let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    //Error if phone is invalid
    if(phone){
        if(firstName || lastName || password){


            //get the token from the headers
            let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
            
            handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
                if(tokenIsValid){
                    //Look up user
                    _data.read('users',phone,function(err,userData){
                        if(!err && userData){
                            //update fields
                            if(firstName){
                                userData.firstName = firstName;
                            }
                            if(lastName){
                                userData.lastName = lastName;
                            }
                            if(password){
                                userData.hashedPassword = helpers.hash(password);
                            }

                            //store new updated object
                            _data.update('users',phone,userData,function(err){
                                if(!err){
                                    callback(200);
                                } else {
                                    console.log(err);
                                    callback(500,{'Error':'Could not update user'});
                                }
                            });

                        } else {
                            callback(400,{'Error':'The specified user does not exist'})
                        }
                    });
                }else{
                    callback(403,{'Error':'Missing required token in header, or token is invalid'});
                }
            });

            
        }else {
            callback(400,{'Error':'Missing fields to update'});
        }
    } else {
        callback(400,{'Error':'Missing required field'});
    }
    
};

//Users delete
//Required field: phone
handlers._users.delete = function(data,callback){
    //check that phone is valid
    let phone = typeof(data.queryStringObject.get('phone')) == 'string' && data.queryStringObject.get('phone').trim().length == 10 ? data.queryStringObject.get('phone').trim() : false;
    if(phone){

        //get the token from the headers
        let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
            if(tokenIsValid){
                //Search user
                _data.read('users',phone,function(err,userData){
                    if (!err && userData){
                        _data.delete('users',phone,function(err){
                            if(!err){
                                //Delete each of the checks associated with the user
                                let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                                console.log(userData);
                                let checksToDelete = userChecks.length;
                                if(checksToDelete > 0){
                                    let checksDeleted = 0;
                                    let deletionErrors = false;

                                    //loop through the checks
                                    userChecks.forEach(function(checkId){
                                        //delete the check
                                        _data.delete('checks',checkId,function(err){
                                            if(err){
                                                deletionErrors = true;
                                            }
                                            checksDeleted ++;
                                            if(checksDeleted == checksToDelete){
                                                if(!deletionErrors){
                                                    console.log('entre');
                                                    callback(200);
                                                } else {
                                                    callback(500,{'Error':'Errors encountered while attempting to delete user\'s checks. All checks may not have been deleted succesfully'})
                                                }
                                            }
                                        });
                                    });
                                }else {
                                    callback(200);
                                }
                            }else {
                                callback(500,{'Error':'Could not delete specified user'});
                            }
                        });
                    }else {
                        callback(400,{'Error':'Could not find specified user'});
                    }
                });
            } else{
                callback(403,{'Error':'Missing required token in header, or token is invalid'});
            }
        });



    } else {
        callback(400,{'Error':'Missing required field'});
    }
};



//tokens handler
handlers.tokens = function(data,callback){
    let acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method.toLowerCase()) > -1){
        handlers._tokens[data.method.toLowerCase()](data,callback);
    } else {
        //return method not allowed (http response)
        callback(405);
    }
};


//Container for tokens methods
handlers._tokens = {};


//Tokens - post
//Required data: phone, password
handlers._tokens.post = function(data,callback){

    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if(phone && password){
        //look up the user that matches phone number
        _data.read('users',phone,function(err,userData){
            if(!err && userData){
                //Hash the sent password and compare it to the stored one
                let hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.hashedPassword){
                    //create new token with random name, with 1 hour expiration
                    let tokenId = helpers.createRandomString(20);
                    let expires = Date.now() + 1000 * 60 * 60;
                    let tokenObject = {
                        'phone':phone,
                        'id':tokenId,
                        'expires':expires
                    };

                    //Store the token
                    _data.create('tokens',tokenId,tokenObject,function(err){
                        if(!err){
                            callback(200,tokenObject);
                        } else {
                            callback(500,{'Error':'Could not create new token'});
                        }
                    });
                } else {
                    callback(400,{'Error':'Password did not match the specified user\'s stored password'});
                }
            }else {
                callback(400,{'Error':'Could not find specified user'});
            }
        })
    }else {
        callback(400,{'Error':'Missing required fields'});
    }
}


//Tokens - get
//Required data: id
handlers._tokens.get = function(data,callback){
    //check that id is valid
    let id = typeof(data.queryStringObject.get('id')) == 'string' && data.queryStringObject.get('id').trim().length == 20 ? data.queryStringObject.get('id').trim() : false;
    if(id){
        //Search user
        _data.read('tokens',id,function(err,tokenData){
            if (!err && tokenData){
                callback(200,tokenData);
            }else {
                callback(404);
            }
        })
    } else {
        callback(400,{'Error':'Missing required field'});
    }
}


//Tokens - put
//Required data: id,extend
handlers._tokens.put = function(data,callback){
    let id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    let extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

    if(id && extend){
        //look up token
        _data.read('tokens',id,function(err,tokenData){
            if(!err && tokenData){
                //verify if token is not expired
                if(tokenData.expires > Date.now()){
                    //set expiration and hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    //store updates
                    _data.update('tokens',id,tokenData,function(err){
                        if(!err){
                            callback(200);
                        } else{
                            callback(500,{'Error':'Could not update the token\'s expiration'});
                        }
                    });
                }else{
                    callback(400,{'Error':'Token has already expired'});
                }
            }else {
                callback(400,{'Error':'Specified token does not exist'});
            }
        });
    } else {
        callback(400,{'Error':'Missing required field(s) or field(s) are invalid'});
    };
}


//Tokens - delete
//required data: id
handlers._tokens.delete = function(data,callback){
     //check that id is valid
     let id = typeof(data.queryStringObject.get('id')) == 'string' && data.queryStringObject.get('id').trim().length == 20 ? data.queryStringObject.get('id').trim() : false;
     if(id){
         //Search token
         _data.read('tokens',id,function(err,data){
             if (!err && data){
                 _data.delete('tokens',id,function(err){
                     if(!err){
                         callback(200);
                     }else {
                         callback(500,{'Error':'Could not delete specified token'});
                     }
                 });
             }else {
                 callback(400,{'Error':'Could not find specified token'});
             }
         })
     } else {
         callback(400,{'Error':'Missing required field'});
     }
}


//Verify if current id is valid for given user
handlers._tokens.verifyToken = function(id,phone,callback){
    //lookup token
    _data.read('tokens',id,function(err,tokenData){
        if(!err && tokenData){
            //check that the token is for the given user and is not expired
            if(tokenData.phone == phone && tokenData.expires > Date.now()){
                callback(true);
            }else{
                callback(false);
            }
        }else {
            callback(false);
        }
    });
};


//Checks handler
handlers.checks = function(data,callback){
    let acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method.toLowerCase()) > -1){
        handlers._checks[data.method.toLowerCase()](data,callback);
    } else {
        //return method not allowed (http response)
        callback(405);
    }
};


//Container for checks methods
handlers._checks = {};


//Checks - post
//required data: protocol, url, method, sucessCodes, timeoutSeconds
handlers._checks.post = function(data,callback){
    //validate inputs
    let protocol = typeof(data.payload.protocol) == 'string' && ['https','http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    let url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    let method = typeof(data.payload.method) == 'string' && ['post','get','put','delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    let successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    let timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 == 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if(protocol && url && method && successCodes && timeoutSeconds){
        //Get token from headers
        let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        //lookup user by reading token
        _data.read('tokens',token,function(err,tokenData){
            if(!err && tokenData){
                let userPhone = tokenData.phone;

                //lookup user data with phone
                _data.read('users',userPhone, function(err,userData){
                    if(!err && userData){
                        let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                        
                        //verify user has less than the number of max checks per user
                        if(userChecks.length < config.maxChecks){
                            //create random id for the check
                            let checkId = helpers.createRandomString(20);

                            //create the check object and include users phone
                            let checkObject = {
                                "id":checkId,
                                "userPhone":userPhone,
                                "protocol":protocol,
                                "url":url,
                                "method": method,
                                "successCodes":successCodes,
                                "timeoutSeconds":timeoutSeconds
                            };

                            //store object 
                            _data.create('checks',checkId, checkObject,function(err){
                                if(!err){
                                    //Add the checkid to the users object
                                    userData.checks = userChecks;
                                    userData.checks.push(checkId);

                                    //save new user data
                                    _data.update('users',userPhone,userData,function(err){
                                        if(!err){
                                            //return new check data
                                            callback(200,checkObject);
                                        }else{
                                            callback(500,{'Error':'Could not update user with the new check'});
                                        }
                                    });
                                } else {
                                    callback(500,{'Error':'Could not create the new check'});
                                }
                            });

                        } else {
                            callback(400,{'Error':'User already has the maximum number of checks ('+config.maxChecks+')'});
                        }
                    }else {
                        callback(403);
                    }
                });
            } else {
                callback(403);
            }
        });

    } else {
        callback(400,{'Error':'Missing required inputs or inputs are invalid'});
    }
};


//checks - get
//required data: id
handlers._checks.get = function(data,callback){
    //Check that phone number is valid
    let id = typeof(data.queryStringObject.get('id')) == 'string' && data.queryStringObject.get('id').trim().length == 20 ? data.queryStringObject.get('id').trim() : false;
    if(id){

        //lookup check
        _data.read('checks',id,function(err,checkData){
            if(!err && checkData){

                //get the token from the headers
                let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

                //verify token is valid and belongs to the user who created the check
                handlers._tokens.verifyToken(token,checkData.userPhone,function(tokenIsValid){
                    if(tokenIsValid){
                        //return check data
                        callback(200,checkData);
                    } else{
                        callback(403);
                    }
                });

            } else {
                callback(404);
            }
        });


    } else {
        callback(400,{'Error':'Missing required field'});
    }
};

//Checks - put
//required data: id
//optional data: protocol, url, method, successCodes, timeoutSeconds (one must be provided)

handlers._checks.put = function(data,callback){
    let id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    
    let protocol = typeof(data.payload.protocol) == 'string' && ['https','http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    let url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    let method = typeof(data.payload.method) == 'string' && ['post','get','put','delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    let successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    let timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 == 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if(id){
        //check for one or more optional data
        if(protocol || url || method || successCodes || timeoutSeconds){
            //lookup the check
            _data.read('checks',id,function(err,checkData){
                if(!err && checkData){
                                    //get the token from the headers
                let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

                //verify token is valid and belongs to the user who created the check
                handlers._tokens.verifyToken(token,checkData.userPhone,function(tokenIsValid){
                    if(tokenIsValid){
                        //update the check where necessary
                        if(protocol){
                            checkData.protocol = protocol;
                        }
                        if(url){
                            checkData.url = url;
                        }
                        if(method){
                            checkData.method = method;
                        }
                        if(successCodes){
                            checkData.successCodes = successCodes;
                        }
                        if(timeoutSeconds){
                            checkData.timeoutSeconds = timeoutSeconds;
                        }

                        //store new updated
                        _data.update('checks',id, checkData, function(err){
                            if(!err){
                                callback(200);
                            }else {
                                callback(500,{'Error':'Could not update the check'});
                            }
                        })
                    }else {
                        callback(403);
                    }
                });
                } else {
                    callback(400,{'Error':'Check ID did not exist'});
                }
            });
        } else {
            callback(400,{'Error':'Missing fields to update'});
        }
    } else {
        callback(400,{'Error':'Missing required field'});
    }
};


//checks - delete
//required data: id
handlers._checks.delete = function(data,callback){
    //check that phone is valid
    let id = typeof(data.queryStringObject.get('id')) == 'string' && data.queryStringObject.get('id').trim().length == 20 ? data.queryStringObject.get('id').trim() : false;
    if(id){

        //lookup the check
        _data.read('checks',id,function(err,checkData){
            if(!err && checkData){

                 //get the token from the headers
                let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

                handlers._tokens.verifyToken(token,checkData.userPhone,function(tokenIsValid){
                    if(tokenIsValid){

                        //Delete the check data
                        _data.delete('checks',id,function(err){
                            if(!err){

                                //Search user
                                _data.read('users',checkData.userPhone,function(err,userData){
                                    if (!err && userData){
                                        let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

                                        //remove the deleted check from their lists of checks
                                        let checkPosition = userChecks.indexOf(id);
                                        if(checkPosition > -1){
                                            userChecks.splice(checkPosition,1);

                                            //resave users data
                                            _data.update('users',checkData.userPhone,userData,function(err){
                                                if(!err){
                                                    callback(200);
                                                }else {
                                                    callback(500,{'Error':'Could not delete update the user'});
                                                }
                                            });
                                        }else{
                                            callback(500,{'Error':'Could not find the check on the users object, so could not remove it'});
                                        }

                                    }else {
                                        callback(500,{'Error':'Could not find the user who created the check, could not remove the check from the list of checks on the user object'});
                                    }
                                });

                            }else{
                                callback(500,{'Error':'Could not delete the check data'});
                            }
                        });

                    } else{
                        callback(403);
                    }
                });

            }else{
                callback(400,{'Error':'The specified check ID does not exist'});
            }
        });

    } else {
        callback(400,{'Error':'Missing required field'});
    }
};


//ping handler
handlers.ping = function(data,callback){
    callback(200);
};

//Not found handler
handlers.notFound = function(data,callback){
    callback(404);
};


//export handlers as module
module.exports = handlers;