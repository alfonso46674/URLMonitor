

//Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');

//declare application
let app = {};

//initialize function
app.init = function(){
    //start server
    server.init();
    //start workers
    workers.init();
};

//execute initialize function
app.init();


//export app
module.exports = app;