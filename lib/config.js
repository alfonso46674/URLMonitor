//Export configuration variables

//container for all environments
let environments = {};

//staging environments (default)
environments.staging = {
    'httpPort': 3000,
    'httpsPort':3001,
    'envName': 'staging',
    'hashingSecret':'secret',
    'maxChecks' : 5
};

//production environment
environments.production = {
    'httpPort': 5000,
    'httpsPort':5001,
    'envName': 'production',
    'hashingSecret':'secret',
    'maxChecks' : 5
};


//Determine which environment to export according to the command line argument NODE_ENV=*
let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//Verify that current environment is one of the ones created above
//Default to staging otherwise
let environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;


module.exports = environmentToExport;