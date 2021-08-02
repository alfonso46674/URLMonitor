//Request handlers

//dependencies
const _data = require('./data')
const helpers = require('./helpers')


//Define handlers
let handlers = {};


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
        callback(400,{'Error':'Missing required fields'});
    }
};

//Users get
//Required data: phone
handlers._users.get = function(data,callback){
    //Check that phone number is valid
    let phone = typeof(data.queryStringObject.get('phone')) == 'string' && data.queryStringObject.get('phone').trim().length == 10 ? data.queryStringObject.get('phone').trim() : false;
    if(phone){
        //Search user
        _data.read('users',phone,function(err,data){
            if (!err && data){
                //remove hashed password
                delete data['hashedPassword'];
                callback(200,data);
            }else {
                callback(404);
            }
        })
    } else {
        callback(400,{'Error':'Missing required field'});
    }
};

//Users put
//Required data: phone
//optional data: firstName, lastName, password (at least one)
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
            })
        }else {
            callback(400,{'Error':'Missing fields to update'});
        }
    } else {
        callback(400,{'Error':'Missing required field'});
    }
    
};

//Users delete
//Required field: phone
//TODO Delete files associated to user
handlers._users.delete = function(data,callback){
    //check that phone is valid
    let phone = typeof(data.queryStringObject.get('phone')) == 'string' && data.queryStringObject.get('phone').trim().length == 10 ? data.queryStringObject.get('phone').trim() : false;
    if(phone){
        //Search user
        _data.read('users',phone,function(err,data){
            if (!err && data){
                _data.delete('users',phone,function(err){
                    if(!err){
                        callback(200);
                    }else {
                        callback(500,{'Error':'Could not delete specified user'});
                    }
                });
            }else {
                callback(400,{'Error':'Could not find specified user'});
            }
        })
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
handlers._tokens.put = function(data,callback){

}


//Tokens - delete
handlers._tokens.delete = function(data,callback){

}



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