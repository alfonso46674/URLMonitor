

//Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli')

//declare application
let app = {};

//initialize function
app.init = function(){
    //start server
    server.init();
    //start workers
    workers.init();

    //start the cli, make sure it starts last
    setTimeout(function(){
        cli.init();
    },50);

};

//execute initialize function
app.init();


//export app
module.exports = app;