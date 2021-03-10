//Dependencies
const http = require('http');
const {URL,URLSearchParams} = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

//Server to respond requests with a string
let server = http.createServer((req,res)=>{

    //Get the URL and parse it
    // let parsedUrl = url.parse(req.url,true);
    let parsedUrl = new URL(req.url, "http://localhost:3000/");

    //Get path of url
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g,'');


    //get the query string as an object
    // let queryStringObject = parsedUrl.query;
    let queryStringObject = new URLSearchParams(parsedUrl.searchParams);
    
    

    //get http method
    let method = req.method.toUpperCase();

    //get the headers as an object
    let headers = req.headers

    //Get the payload, if any
    let decoder = new StringDecoder('utf-8');
    let buffer = ''; // holds the data of the stream
    req.on('data', (data)=>{
        //as the data is streamed in piece by piece, its appended to the buffer
        buffer += decoder.write(data);
        
    });

    //when there is no more data to consume - End event -
    req.on('end',()=>{
        buffer += decoder.end();

        //chose the handler the request should go to, if not found use notFound handler
        let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        //construct data object to send to the handler
        let data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        };

        //Route request to handler specified in router
        chosenHandler(data,function(statusCode,payload){
            //use status code called by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            //use payload called by handler, or default to empty object
            payload = typeof(payload) == 'object' ? payload : {};

            //Convert payload to string
            let payloadString = JSON.stringify(payload);

            //return response
            res.setHeader('Content-Type','application/json')
            res.writeHead(statusCode);
            res.end(payloadString);
            

            //log requested path
            console.log("Returning this response: " + statusCode, payloadString);  

        });
            
    });

    
});

//Start the server
server.listen(config.port, ()=>{
    console.log("The server is listening on port "+config.port+" in "+config.envName+" mode");
});

//Define handlers
let handlers = {};

//sample handler
handlers.sample = function(data,callback){
    //callback http status code and a payload object
    callback(406,{'name':'sample handler'});
};

//Not found handler
handlers.notFound = function(data,callback){
    callback(404);
};

//Define a request router
let router = {
    "sample": handlers.sample
};