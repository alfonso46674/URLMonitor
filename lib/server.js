//File with server related tasks


//Dependencies
const http = require('http');
const https = require('https');
const {URL,URLSearchParams} = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs')
const config = require('./config');
const handlers = require('./handlers')
const helpers = require('./helpers')
const path = require('path')


//instantiate server module object
let server = {};

//http server instance
server.httpServer = http.createServer((req,res)=>{
    
    server.unifiedServer(req,res);
});


//https server instance
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions,(req,res)=>{
    server.unifiedServer(req,res);
});



//server logic for both http and https server
server.unifiedServer = function(req,res){
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
        let chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        //construct data object to send to the handler
        let data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
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
};

//Define a request router
server.router = {
    "ping": handlers.ping,
    "users": handlers.users,
    "tokens": handlers.tokens,
    "checks":handlers.checks
};

//initialize function
server.init = function(){
    
    //Start the http server
    server.httpServer.listen(config.httpPort, ()=>{
        console.log('\x1b[36m%s\x1b[0m',"The server is listening on port "+config.httpPort+" in "+config.envName+" mode");

    });

    //start https server
    server.httpsServer.listen(config.httpsPort, ()=>{
        console.log('\x1b[35m%s\x1b[0m',"The server is listening on port "+config.httpsPort+" in "+config.envName+" mode");

    });
};

//export server module
module.exports = server;