const { huggingfaceAPI } = require("./hf");

// make a switch statement to handle different api handlers
// apiHandler is a string that is passed in as a command line argument
// when the server is started
// e.g. node app.js API_HANDLER=hf
// this will set apiHandler to 'hf'
// then we can use that to determine which api handler to use
// e.g. if (apiHandler === 'hf-<Model_Name>') { ... }
// if (apiHandler === 'openai-davinci') { ... }
// if (apiHandler === 'openai-gptturbo') { ... }
// etc.

const defaultAPIHandler = {
    name: 'hf',
    handler: huggingfaceAPI
}

module.export = async function(provider, model) {
    if(!provider) {
        // return default api handler
        return defaultAPIHandler;
    }
    if(provider === 'hf' && !model) {
        
    }
}