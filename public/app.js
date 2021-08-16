// Front end logic for application

//container for the fronend application
let app = {};

//Config object
app.config = {
    'sessionToken' : false,
};

// AJAX client (for restful api)
app.client = {};

// Call the init processes after the window loads
window.onload = function(){
    app.init();
    };
    
// Init (bootstrapping)
app.init = function(){
    // Bind all form submissions
    app.bindForms();

    //bind logout button
    app.bindLogoutButton();

    //get token from localstorage and evaluate if it exists
    app.getSessionToken();

    //renew token every minute (if it exists)
    app.tokenRenewalLoop();
};

//interface for making API calls
app.client.request = function(headers,path,method,queryStringObject,payload,callback){
    //set defaults
    headers = typeof(headers) == 'object' && headers !== null ? headers : {};
    path = typeof(path) == 'string' ? path : '/';
    method = typeof(method) == 'string' && ['POST','GET','PUT','DELETE'].indexOf(method) > -1 ? method.toUpperCase() : 'GET';
    queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
    payload = typeof(payload) == 'object' && payload !== null ? payload : {};
    callback = typeof(callback) == 'function' ? callback : false;


    //for each query string parameter sent, add it to the path
    let requestUrl = path+'?';
    let counter = 0;
    for(let queryKey in queryStringObject){
        if(queryStringObject.hasOwnProperty(queryKey)){
            counter++;
            //if at least one query string parameter has already been added, prepend new ones with ampersand
            if(counter > 1){
                requestUrl+='&';
            }
            //Add the key and value
            requestUrl+=queryKey+'='+queryStringObject[queryKey];
        }
    }

    //Form the http request as json type
    let xhr = new XMLHttpRequest();
    xhr.open(method,requestUrl,true);
    xhr.setRequestHeader('Content-Type','application/json');

    //for each header sent, add it to the request
    for(let headerKey in headers){
        if(headers.hasOwnProperty(headerKey)){
            xhr.setRequestHeader(headerKey,headers[headerKey])
        }
    }

    //if there is a current session token set, add that as a header
    if(app.config.sessionToken){
        xhr.setRequestHeader("token",app.config.sessionToken.id);
    }

    //when the request comes back, handle the response
    xhr.onreadystatechange = function(){
        if(xhr.readyState == XMLHttpRequest.DONE){
            let statusCode = xhr.status;
            let responseReturned = xhr.responseText;

            //callback if requested
            if(callback){
                try{
                    let parsedResponse = JSON.parse(responseReturned);
                    callback(statusCode,parsedResponse);
                }catch(e){
                    callback(statusCode,false);
                }
            }
        }
    }

    //send payload as payload
    let payloadString = JSON.stringify(payload);
    xhr.send(payloadString);
 };

 

// Bind the forms
app.bindForms = function(){
    if(document.querySelector("form")){
        document.querySelector("form").addEventListener("submit", function(e){
    
          // Stop it from submitting
          e.preventDefault();
          var formId = this.id;
          var path = this.action;
          var method = this.method.toUpperCase();
    
          // Hide the error message (if it's currently shown due to a previous error)
          document.querySelector("#"+formId+" .formError").style.display = 'hidden';
    
          // Turn the inputs into a payload
          var payload = {};
          var elements = this.elements;
          for(var i = 0; i < elements.length; i++){
            if(elements[i].type !== 'submit'){
              var valueOfElement = elements[i].type == 'checkbox' ? elements[i].checked : elements[i].value;
              payload[elements[i].name] = valueOfElement;
            }
          }
    
          // Call the API
          app.client.request(undefined,path,method,undefined,payload,function(statusCode,responsePayload){
            // Display an error on the form if needed
            if(statusCode !== 200){

              if(statusCode == 403){
                //log user out
                console.log('Entrando logUserOut');
                app.logUserOut();
              } else {
                 // Try to get the error from the api, or set a default error message
                var error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';
      
                // Set the formError field with the error text
                document.querySelector("#"+formId+" .formError").innerHTML = error;
      
                // Show (unhide) the form error field on the form
                document.querySelector("#"+formId+" .formError").style.display = 'block';
              }
            } else {
              // If successful, send to form response processor
              app.formResponseProcessor(formId,payload,responsePayload);
            }
    
          });
        });
      }
  };


/*
LOGIN AND CREATE ACCOUNT LOGIC
*/
  // Form response processor
app.formResponseProcessor = function(formId,requestPayload,responsePayload){
    var functionToCall = false;
    // Log the user in after the account is created
    if(formId == 'accountCreate'){
        // Take the phone and password, and use it to log the user in
        var newPayload = {
            'phone' : requestPayload.phone,
            'password' : requestPayload.password
            };
        
            app.client.request(undefined,'api/tokens','POST',undefined,newPayload,function(newStatusCode,newResponsePayload){
            // Display an error on the form if needed
                if(newStatusCode !== 200){
            
                    // Set the formError field with the error text
                    document.querySelector("#"+formId+" .formError").innerHTML = 'Sorry, an error has occured. Please try again.';
            
                    // Show (unhide) the form error field on the form
                    document.querySelector("#"+formId+" .formError").style.display = 'block';
            
                } else {
                    // If successful, set the token and redirect the user
                    app.setSessionToken(newResponsePayload);
                    window.location = '/checks/all';
                }
            });  
    }

    // If login was successful, set the token in localstorage and redirect the user
    if(formId == 'sessionCreate'){
        app.setSessionToken(responsePayload);
        window.location = '/checks/all';
    }
  }; 

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = function(add){
    var target = document.querySelector("body");
    if(add){
      target.classList.add('loggedIn');
    } else {
      target.classList.remove('loggedIn');
    }
  };


// Set the session token in the app.config object as well as localstorage
app.setSessionToken = function(token){
    app.config.sessionToken = token;
    var tokenString = JSON.stringify(token);
    localStorage.setItem('token',tokenString);
    if(typeof(token) == 'object'){
      app.setLoggedInClass(true);
    } else {
      app.setLoggedInClass(false);
    }
  };

  // Get the session token from localstorage and set it in the app.config object
app.getSessionToken = function(){
    var tokenString = localStorage.getItem('token');
    if(typeof(tokenString) == 'string'){
      try{
        var token = JSON.parse(tokenString);
        app.config.sessionToken = token;
        if(typeof(token) == 'object'){
          app.setLoggedInClass(true);
        } else {
          app.setLoggedInClass(false);
        }
      }catch(e){
        app.config.sessionToken = false;
        app.setLoggedInClass(false);
      }
    }
  };


  // Renew the token
app.renewToken = function(callback){
    var currentToken = typeof(app.config.sessionToken) == 'object' ? app.config.sessionToken : false;
    if(currentToken){
      // Update the token with a new expiration
      var payload = {
        'id' : currentToken.id,
        'extend' : true,
      };
      app.client.request(undefined,'api/tokens','PUT',undefined,payload,function(statusCode,responsePayload){
        // Display an error on the form if needed
        if(statusCode == 200){
          // Get the new token details
          var queryStringObject = {'id' : currentToken.id};
          app.client.request(undefined,'api/tokens','GET',queryStringObject,undefined,function(statusCode,responsePayload){
            // Display an error on the form if needed
            if(statusCode == 200){
              app.setSessionToken(responsePayload);
              callback(false);
            } else {
              app.setSessionToken(false);
              callback(true);
            }
          });
        } else {
          app.setSessionToken(false);
          callback(true);
        }
      });
    } else {
      app.setSessionToken(false);
      callback(true);
    }
  };

  // Loop to renew token often
app.tokenRenewalLoop = function(){
    setInterval(function(){
      app.renewToken(function(err){
        if(!err){
          console.log("Token renewed successfully @ "+Date.now());
        }
      });
    },1000 * 60);
  };


/*
LOGOUT LOGIC
*/

// Bind the logout button
app.bindLogoutButton = function(){
  document.getElementById("logoutButton").addEventListener("click", function(e){

    // Stop it from redirecting anywhere
    e.preventDefault();
    console.log('entreBindLogout');
    // Log the user out
    app.logUserOut();

  });
};

// Log the user out then redirect them
app.logUserOut = function(){
  // Get the current token id
  var tokenId = typeof(app.config.sessionToken.id) == 'string' ? app.config.sessionToken.id : false;

  // Send the current token to the tokens endpoint to delete it
  var queryStringObject = {
    'id' : tokenId
  };
  app.client.request(undefined,'api/tokens','DELETE',queryStringObject,undefined,function(statusCode,responsePayload){
    // Set the app.config token as false
    app.setSessionToken(false);
    console.log('terminandoLogUserOut');
    // Send the user to the logged out page
    window.location = '/session/deleted';

  });
};


