'use strict';
var http = require('http'),
    io = require('socket.io');


var buildResponse = function(req){
  return {
    headers: req.headers,
    url: req.url,
    method: req.method
  };
};

var server = http.createServer(function (req, res) {
  var obj = buildResponse(req);
  io.sockets.emit('request', obj);
  //console.log(obj);
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(obj));
});

io = io.listen(server);

//TID Corporative network fails accessing websockets, so we choose the
//most conservative one
io.configure(function () {
  io.set('transports', ['xhr-polling']);
});


server.listen(process.env.VMC_APP_PORT || 1337);




