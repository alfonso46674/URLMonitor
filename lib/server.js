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
const util = require('util')
const debug = util.debuglog('server');

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
        chosenHandler(data,function(statusCode,payload,contentType){
            //determine type of response (fallback to JSON)
            contentType = typeof(contentType) == 'string' ? contentType : 'json';

            //use status code called by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            //return response parts that area content-specific
            let payloadString = '';
            if(contentType == 'json'){
                //use payload called by handler, or default to empty object
                payload = typeof(payload) == 'object' ? payload : {};
                //Convert payload to string
                payloadString = JSON.stringify(payload);
                //set contentType header to json
                res.setHeader('Content-Type','application/json');
            }
            if(contentType == 'html'){
                //use payload called by handler, or default to empty string
                payloadString = typeof(payload) == 'string' ? payload : '';
                //set contentType header to html
                res.setHeader('Content-Type','text/html');
            }

            //return response-parts that are common to all content-types
            res.writeHead(statusCode);
            res.end(payloadString);

            //if the response is 200, print green otherwise print red
            if(statusCode == 200){
                debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);  
            } else {
                debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);  
            }

        });
            
    });
};

//Define a request router
server.router = {
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/edit' : handlers.accountEdit,
    'account/deleted' : handlers.accountDeleted,
    'session/create' : handlers.sessionCreate,
    'session/deleted' : handlers.sessionDeleted,
    'checks/all' : handlers.checksList,
    'checks/create' : handlers.checksCreate,
    'checks/edit' : handlers.checksEdit,
    "ping": handlers.ping,
    "api/users": handlers.users,
    "api/tokens": handlers.tokens,
    "api/checks":handlers.checks
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