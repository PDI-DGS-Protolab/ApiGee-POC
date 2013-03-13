var usergrid = require('usergrid');

var exports = module.exports = {};

var orgName = 'javier',
    appName = 'tdaf';

var userGridOptions = {
    orgName:orgName,
    appName:appName,
    authType:usergrid.AUTH_CLIENT_ID,
    clientId:'YXA6fxccUIvSEeKOiQLoGtzz0A',
    clientSecret:'YXA6kreTeIhVNFdaxAc74A614CLGbHo',
    logging: false, //optional - turn on logging, off by default
    buildCurl: false //optional - turn on curl commands, off by default
};

var client = new usergrid.client(userGridOptions);

var login = function login(username, password, callback){
    client.login(username, password,
        function (err) {
            if (err) {
                callback(err)
            } else {
                //success - user has been logged in
                //the login call will return an OAuth token, which is saved
                //in the client object for later use.  Access it this way:
                var token = client.token;

                //then make a new client just for the app user, then use this
                //client to make calls against the API
                var appUserClient = new usergrid.client({
                    orgName:orgName,
                    appName:appName,
                    authType:usergrid.AUTH_APP_USER,
                    token:token
                });

                //Then make calls against the API.  For example, you can
                //get the user entity this way:
                appUserClient.getLoggedInUser(function(err, data, user) {
                    if(err) {
                        callback(err);
                        //error - could not get logged in user
                    } else {
                        //success - got logged in user
                        callback(null, user);
                    }
                });

            }
        }
    );
}

exports.login = login;