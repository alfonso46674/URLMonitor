// CLI related tasks

//dependencies
const readLine = require('readline');
const util = require('util');
const debug = util.debuglog('cli');
const events = require('events');
class _events extends events{};
const e = new _events();

//instantiate cli module
const cli = {};

//init script 
cli.init = function(){
    //send the start message to console in dark blue
    console.log('\x1b[34m%s\x1b[0m',"The CLI is running");

    //start interface
    let _interface = readLine.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '>'
    });

    //create an initial prompt
    _interface.prompt();

    //handle each line of input separately
    _interface.on('line',function(str){
        //send to the input processor
        cli.processInput(str);

        //reinitialize the prompt
        _interface.prompt();
    });

    //if the users stops the CLI, kill associated process
    _interface.on('close',function(){
        process.exit(0);
    });
};

//input processor
cli.processInput = function(str){
    str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;

    //only process input if the user wrote something
    if(str){
        //Codify unique strings that identigy the allowed questions ( commands )
        let uniqueInputs = [
            'man',
            'help',
            'exit',
            'stats',
            'list users',
            'more user info',
            'list checks',
            'more check info',
            'list logs',
            'more log info'
        ];

        //find a match and emit an event if one is found in the uniqueInputs
        let matchFound = false;
        let counter = 0;
        uniqueInputs.some(function(input){
            if(str.toLowerCase().indexOf(input) > -1){
                matchFound = true;
                //emit event matching the unique input, include the full string given by the user
                e.emit(input,str);
                return true;
            }
        });

        //if no match is found, tell to try again
        if(!matchFound){
            console.log('Sorry, try again');
        }
    }
};

//export cli module
module.exports = cli;