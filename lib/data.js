// Library for storing and editing data


//Dependencies
let fs = require('fs');
let path = require('path');

//container for this module
let lib = {};

//base directory for the data folder
lib.baseDir = path.join(__dirname,'/../.data/');


//Write data to a file
lib.create = function(dir,file,data,callback){
    //try to open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',function(err,fileDescriptor){
        if(!err && fileDescriptor){
            //convert data to string
            let stringData = JSON.stringify(data);

            //write to file and close it
            fs.writeFile(fileDescriptor,stringData,function(err){
                if(!err){
                    fs.close(fileDescriptor,function(err){
                        if(!err){
                            callback(false);
                        }else{
                            callback('Error closing new file');
                        }
                    });
                }else {
                    callback('Error writing to new file');
                }
            })
        }else {
            callback('Could not create new file, it may already exist');
        }
    });
};

//Read data from a file
lib.read = function(dir,file,callback){
    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8',function(err,data){
        callback(err,data);
    });
};


//Update file with new data
lib.update = function(dir,file,data,callback){
    //open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err,fileDescriptor){
        if(!err && fileDescriptor){
            //convert data to string
            let stringData = JSON.stringify(data);

            //Truncate the file 
            fs.truncate(fileDescriptor,function(err){
                if(!err){
                    //write to the file and close it
                    fs.writeFile(fileDescriptor,stringData,function(err){
                        if(!err){
                            fs.close(fileDescriptor,function(err){
                                if(!err){
                                    callback(false);
                                }else{
                                    callback('Error closing existing file');
                                }
                            })
                        }else{
                            callback('Erro writing to existing file');
                        }
                    });
                }else{
                    callback('Error truncating file');
                }
            })
        }else {
            callback('Could not open the file for updating, it may not exist yet');
        }
    });
};

//Delete a file
lib.delete = function(dir,file,callback){
    //Unlinkthe file
    fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){
        if(!err){
            callback(false);
        }else{
            callback('Error deleting file');
        }
    });
}

//Export the module
module.exports = lib;