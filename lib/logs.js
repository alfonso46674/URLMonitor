//library for storing and rotating logs

//Dependencies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

//Container for the module
let lib = {};

//base directory of the logs folder
lib.baseDir = path.join(__dirname,'/../.logs/');

//append string to a file. Create file if it doesnot exist
lib.append = function(file,str,callback){
    //open file for appending
    fs.open(lib.baseDir+file+'.log','a',function(err,fileDescriptor){
        if(!err && fileDescriptor){
            //append to file and close it
            fs.appendFile(fileDescriptor,str+'\n',function(err){
                if(!err){
                    fs.close(fileDescriptor,function(err){
                        if(!err){
                            callback(false);
                        }else{
                            callback('Error closing file that was being appended')
                        }
                    })
                }else{
                    callback('Error appending to file');
                }
            });

        } else {
            callback('Could not open file for appending');
        }
    });
};


//list all of the logs, and optionally include compressed logs 
lib.list = function(includeCompressedLogs,callback){
    fs.readdir(lib.baseDir,function(err,data){
        if(!err && data && data.length > 0){
            let trimmedFileNames = [];
            data.forEach(function(FileName){
                //add the .log files
                if(FileName.indexOf('.log') > -1){
                    trimmedFileNames.push(FileName.replace('.log',''));
                }

                //Add compressed files (.gz files)
                if(FileName.indexOf('.gz.b64') >-1 && includeCompressedLogs){
                    trimmedFileNames.push(fileName.replace('.gz.b64',''));
                }
            });
            callback(false,trimmedFileNames);
        } else {
            callback(err,data);
        }
    });
};


//Compress contents of .log file into a .gz.b64 file in the same directory
lib.compress = function(logId,newFileId,callback){
    let sourceFile = logId+'.log';
    let destinationFile = newFileId+'.gz.b64';

    //Read source file
    fs.readFile(lib.baseDir+sourceFile,'utf8',function(err,inputString){
        if(!err && inputString){
            //compress data using gzip
            zlib.gzip(inputString,function(err,buffer){
                if(!err && buffer){
                    //send compressed data to destination file
                    fs.open(lib.baseDir+destinationFile,'wx',function(err,fileDescriptor){
                        if(!err && fileDescriptor){
                            //write to destination file
                            fs.writeFile(fileDescriptor,buffer.toString('base64'),function(err){
                                if(!err){
                                    //close destination file
                                    fs.close(fileDescriptor,function(err){
                                        if(!err){
                                            callback(false);
                                        } else{
                                            callback(err);
                                        }
                                    })
                                } else {
                                    callback(err);
                                }
                            });
                        } else {
                            callback(err);
                        }
                    })
                }else {
                    callback(err);
                }
            })
        } else {
            callback(err);
        }
    });
};

//decompress the contents of a .gz.b64 file into a string variable
lib.decompress = function(fileId,callback){
    let fileName = fileId + '.gz.b64';
    fs.readFile(lib.baseDir+fileName,'utf8',function(err,string){
        if(!err && string){
            //decompress data
            let inputBuffer = Buffer.from(str,'base64');
            zlib.unzip(inputBuffer,function(err,outputBuffer){
                if(!err && outputBuffer){
                    let str = outputBuffer.toString();
                    callback(false,str);
                } else {
                    callback(err);
                }
            });
        } else {
            callback(err);
        }
    })
};


//truncate a log file
lib.truncate = function(logId,callback){
    fs.truncate(lib.baseDir+logId+'.log',0,function(err){
        if(!err){
            callback(false);
        } else {
            callback(err);
        }
    })
};

//export module
module.exports = lib;