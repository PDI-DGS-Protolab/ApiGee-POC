
/**
 * Module dependencies.
 */

var express = require('express'),
    time = require('./routes/time'),
    auth = require('./routes/auth'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    everyauth = require('everyauth'),
    uuid = require('node-uuid');

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
        return (usersByTwitId[user.id] = addUser('Twitter', user.name));
    })
    .redirectPath('/');

everyauth.google
    .appId('20944565875.apps.googleusercontent.com')
    .appSecret('HwtVG4Bq_zSqo2isN6Yr_G-t')
    .scope('https://www.googleapis.com/auth/userinfo.profile')
    .findOrCreateUser( function (session, accessToken, accessTokenExtra, user) {
        console.log(user);
        return  (usersByGoogleId[user.id] = addUser('Google', user.name));
    })
    .redirectPath('/');

/*
 Consumer Key for first tests
 ONa0kd4CsYftGGYgfCjYXn94sLrZAA8S
 Consumer Secret
 9hwqAcMMHltPOb7h
 */
everyauth.movistar
    .oauthHost('http://authserver-test.tdaf.tid.es')
    .appId('5tnLxfJ3pzy14sQCIcjhT4jruHS9tLqj')
    .appSecret('lQEoAuE8tE3aDZcT')
    //.appId('ONa0kd4CsYftGGYgfCjYXn94sLrZAA8S')
    //.appSecret('9hwqAcMMHltPOb7h')
    .scope('test.scope test.scope2')
    .findOrCreateUser( function (session, accessToken, accessTokenExtra, user) {
        console.log(accessToken, accessTokenExtra);
        return (usersByMovistarId[user.userId] = addUser('TDAF', user.firstName + ' ' + user.surname));
    })
    .redirectPath('/');


app.configure(function(){
  app.set('port', process.env.VMC_APP_PORT || 9000);
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

app.get('/jack',  function(req, res){
  var tokenInfo;
  if (req.session.auth  && req.session.auth.movistar){
    tokenInfo = req.session.auth.movistar
  }
  if (tokenInfo){
    res.json({"token": tokenInfo.accessToken});
  }
  else {
    res.json({"error": "Mira a ver si te conectas antes, ladron"});

  }


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
        res.json({error:"Ha fallado la peticion, probablemente la haya cancelado",
            desc:e});
    });
    reqApi.setTimeout(5000, function (){
        reqApi.abort();
    });
    reqApi.end();
    console.log('He lanzado la request a la API');

}


app.get('/callCats', function (req, res){
  var tokenInfo;
  if (req.session.auth  && req.session.auth.movistar){
    tokenInfo = req.session.auth.movistar

  }

  var options = {
    host: '50.112.37.160',
    port: 8080,
    path: '/cats',
    method: 'GET'
  };
  if (tokenInfo){
    options.headers = {
      Authorization: "Bearer " + tokenInfo.accessToken
    };
  }

  performCall(req, res, options);

});



app.get('/callTime', function (req, res){
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


app.get('/callProxy', function (req, res){
  var tokenInfo;
  if (req.session.auth  && req.session.auth.movistar){
    tokenInfo = req.session.auth.movistar
  }

  var options = {
    host: 'foo-test.apigee.net',
    port: 80,
    path: '/proxy/' + uuid.v4(),
    method: 'GET'
  };
  if (tokenInfo){
    options.headers = {
      Authorization: "Bearer " + tokenInfo.accessToken
    };
  }

  performCall(req, res, options);

});


app.get('/callDogs', function (req, res){
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

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
