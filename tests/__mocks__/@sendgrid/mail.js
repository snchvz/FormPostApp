//use mocks to mimic libraries
//for example, we set setApiKey and send function from sendgrid as empty,
//so that jest tests runs the mocks libraries with empty setApikey and send functions
//and we avoid sending emails when running tests
module.exports = {
    setApiKey() {

    },
    send(){

    }
}