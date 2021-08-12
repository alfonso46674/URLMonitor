// Front end logic for application

//container for the fronend application
let app = {};

//Config object
app.config = {
    'sessionToken' : false,
};

// AJAX client (for restful api)
app.client = {};

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