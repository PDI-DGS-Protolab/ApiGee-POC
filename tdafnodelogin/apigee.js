
var http = require('http');

var exports = module.exports = {};



var performCall = function performCall(options, callback){
    var reqApi = http.request(options, function (resApi){
        var data = "";
        console.log('Conectado a la API');
        resApi
            .on('data', function(chunk){
                data += chunk.toString();
            })
            .on('end', function (){
                console.log('Finalizó la peticion.');
                callback(null, data);
            });
    });
    reqApi.on('error', function (e){
        console.log('Fallo la petion a la API');
        callback(e);
    });
    reqApi.setTimeout(5000, function (){
        reqApi.abort();
    });
    reqApi.end();
    console.log('He lanzado la request a la API');

}
