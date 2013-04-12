
/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    everyauth = require('everyauth'),
    ejs = require('ejs'),
    user = require('./user');

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
  app.set('port', process.env.VMC_APP_PORT || 3001);
  app.set('views', __dirname + '/public');
  app.engine('.html', ejs.renderFile);
  app.set('view engine', 'html');
  app.set('view options', {
    layout: false
  });
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({secret:'secretillo', store: new express.session.MemoryStore()}));


  app.use(everyauth.middleware());

  app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));


});

app.configure('development', function(){
  app.use(express.errorHandler());
});


//client_id=ONa0kd4CsYftGGYgfCjYXn94sLrZAA8S&response_type=code&scope=dogs
app.get('/', function(req, res){
    console.log("yihaaa", req.session);
    res.render('index');
});



//client_id=ONa0kd4CsYftGGYgfCjYXn94sLrZAA8S&response_type=code&scope=dogs
app.get('/authinfo', function(req, res){

    res.json({clientId:req.session.loginParams.clientId,
        scope:req.session.loginParams.scope,
        username: req.session.user.name,
        picture: req.session.user.picture
    });
});


//client_id=ONa0kd4CsYftGGYgfCjYXn94sLrZAA8S&response_type=code&scope=dogs
app.get('/authorize/:clientId/:responseType/:scope', function(req, res){
    var p = req.session.loginParams = {};
    p['clientId'] = req.param('clientId');
    p['responseType'] = req.param('responseType');
    p['scope'] = req.param('scope');

    if (req.session.user){
        console.log('Usuario autenticado', req.session.user);
        res.redirect('/#auth')
    }
    else {
        console.log('Usuario desconocido')
        res.redirect('/#login')
    }
    console.log('Entrando a login', req.session);
});


app.post('/userlogin', function(req, res){
  console.log('Entrando a userlogin', req.session);
  user.login(req.param('username'), req.param('password'), function (err, userEntity){
    if (err){
      console.log("El user no ha hecho login")  ;
      res.end('error');
    }
    else{
      console.log("User logged", userEntity.get('username'));
      req.session.user = {};
      req.session.user.name = userEntity.get('name');
      req.session.user.picture = userEntity.get('picture');
      res.redirect('/#auth');
    }
  });
});


 /*
  * Llamado cuando Apigee quiere hacer login user/password
  * para el grantype password
  */
app.get('/login', function(req, res){
  console.log('Entrando a login', req.session);
  user.login(req.param('username'), req.param('password'), function (err, userEntity){
    if (err){
      res.statusCode = 401;
      res.json({'error':'Invalid user/password'});
    }
    else{
      console.log("User logged", userEntity.get('username'));
      res.json({user:{
        id:userEntity.get('uuid'),
        name: userEntity.get('name'),
        picture: userEntity.get('picture')
      }});
    }
  });
});


app.post('/userauth', function(req, res){
    /*
     var p = req.session.loginParams = {};
     p['clientId'] = req.param('clientId');
     p['responseType'] = req.param('responseType');
     p['scope'] = req.param('scope');
     */
   res.redirect('https://foo-test.apigee.net/oauth/authorizationcode?client_id=' +
    req.session.loginParams.clientId + '&response_type=' +
       req.session.loginParams.responseType + '&scope=' +
       req.session.loginParams.scope
   );
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
