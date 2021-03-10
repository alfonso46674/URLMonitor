//Export configuration variables

//container for all environments
let environments = {};

//staging environments (default)
environments.staging = {
    'port': 3000,
    'envName': 'staging'
};

//production environment
environments.production = {
    'port': 5000,
    'envName': 'production'
};


//Determine which environment to export according to the command line argument NODE_ENV=*
let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//Verify that current environment is one of the ones created above
//Default to staging otherwise
let environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;


module.exports = environmentToExport;