
/**
 * Module dependencies.
 */

var express = require('express'),
    time = require('./routes/time'),
    auth = require('./routes/auth'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    everyauth = require('everyauth');

var app = express();

// Configure Facebook auth
var usersById = {},
    nextUserId = 0,
    usersByMovistarId = {}
    usersByGoogleId = {},
    usersByTwitId = {};


// add a user to the in memory store of users.  If you were looking to use a persistent store, this
// would be the place to start
function addUser (source, sourceUser) {
    var user;
    if (arguments.length === 1) {
        user = sourceUser = source;
        user.id = ++nextUserId;
        return usersById[nextUserId] = user;
    } else { // non-password-based
        user = usersById[++nextUserId] = {id: nextUserId};
        user.from = source;
        user.name = sourceUser;
    }
    return user;
}

everyauth.debug = true;

everyauth.everymodule.
    findUserById(function (id, callback) {
        callback(null, usersById[id]);
    });

everyauth.twitter
    .consumerKey("JLCGyLzuOK1BjnKPKGyQ")
    .consumerSecret("GNqKfPqtzOcsCtFbGTMqinoATHvBcy1nzCTimeA9M0")
    .findOrCreateUser( function (sess, accessToken, accessSecret, user) {
        return usersByTwitId[user.id] || (usersByTwitId[user.id] = addUser('Twitter', user.name));
    })
    .redirectPath('/');

everyauth.google
    .appId('20944565875.apps.googleusercontent.com')
    .appSecret('HwtVG4Bq_zSqo2isN6Yr_G-t')
    .scope('https://www.googleapis.com/auth/userinfo.profile')
    .findOrCreateUser( function (session, accessToken, accessTokenExtra, user) {
        console.log(user);
        return usersByGoogleId[user.id] || (usersByGoogleId[user.id] = addUser('Google', user.name));
    })
    .redirectPath('/');

/*
 Consumer Key
 ONa0kd4CsYftGGYgfCjYXn94sLrZAA8S
 Consumer Secret
 9hwqAcMMHltPOb7h
 */
everyauth.movistar
    .appId('ONa0kd4CsYftGGYgfCjYXn94sLrZAA8S')
    .appSecret('9hwqAcMMHltPOb7h')
    .scope('dogs')
    .findOrCreateUser( function (session, accessToken, accessTokenExtra, user) {
        console.log(accessToken, accessTokenExtra);
        return usersByMovistarId[user.id] || (usersByMovistarId[user.id] = addUser('Movistar', user.name));
    })
    .redirectPath('/');


app.configure(function(){
  app.set('port', process.env.VMC_APP_PORT || 3000);
  app.set('views', __dirname + '/public');
  app.engine('.html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.set('view options', {
    layout: false
  });
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({secret:'secretillo'}));

  app.use(express.static(path.join(__dirname, 'public')));

  app.use(everyauth.middleware());

  app.use(app.router);

});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
    res.render('index');
});

//Servicio publico de obtener el la hora
app.get('/time/get', function(req, res){
    res.json({time:new Date()});
});

function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};
//Servicio publico de obtener el la hora
app.get('/dogs/get', function(req, res){
    res.json(shuffle(['Scooby Doo', 'Rex', 'Ayudante de Santa Claus', 'Pluto',
        'Odie', 'Snoopy', 'Laika', 'Milu','Lassie','Pulgoso']).slice(0,3));
});


app.get('/user',  function(req, res){
    res.json(req.user);
});

var performCall = function performCall(req,res, options){
    var reqApi = http.request(options, function (resApi){
        var data = "";
        console.log('Conectado a la API');
        resApi
            .on('data', function(chunk){
                data += chunk.toString();
            })
            .on('end', function (){
                console.log('Finalizó la peticion. Notificando al HTML');
                res.end(data);
            });
    });
    reqApi.on('error', function (e){
        console.log('Fallo la petion a la API');
        res.json({error:"Ha fallado la peticion, probablemente la haya cancelado pq tarda demasiado Apigee",
            desc:e});
    });
    reqApi.setTimeout(5000, function (){
        reqApi.abort();
    });
    reqApi.end();
    console.log('He lanzado la request a la API');

}

app.get('/calltime', function (req, res){
    var tokenInfo;
    if (req.session.auth  && req.session.auth.movistar){
        tokenInfo = req.session.auth.movistar

    }

    var options = {
        host: 'foo-test.apigee.net',
        port: 80,
        path: '/time/get',
        method: 'GET'
    };
    if (tokenInfo){
        options.headers = {
            Authorization: "Bearer " + tokenInfo.accessToken
        };
    }

    performCall(req, res, options);

});


app.get('/calldogs', function (req, res){
    var tokenInfo;
    if (req.session.auth  && req.session.auth.movistar){
        tokenInfo = req.session.auth.movistar

    }

    var options = {
        host: 'foo-test.apigee.net',
        port: 80,
        path: '/dogs/get',
        method: 'GET'
    };
    if (tokenInfo){
        options.headers = {
            Authorization: "Bearer " + tokenInfo.accessToken
        };
    }

    performCall(req, res, options);

});
/*
https://foo-test.apigee.net/oauth/authorize?response_type=code&client_id=jwAW3e130Bxi6xrZXlyXGBvtGO2nIV4K&redirect_uri=&scope=READ&state=foobar
 */

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
