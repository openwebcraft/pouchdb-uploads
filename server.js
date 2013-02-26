var http = require('http')
    , send = require('send')
    , url = require('url')
    , path = require('path');

var port = process.env.PORT || 3000;
var path = path.resolve('./public');

/* A simple TCP server which listens on port 3000
 * and transfers arbitrary files from ./public/ dir.
 */
var app = http.createServer(function(req, res){
    // your custom error-handling logic:
    function error(err) {
        res.statusCode = err.status || 500;
        res.end(err.message);
    }

    // your custom directory handling logic:
    function redirect() {
        res.statusCode = 301;
        res.setHeader('Location', req.url + '/');
        res.end('Redirecting to ' + req.url + '/');
    }

    // transfer arbitrary files from within
    // ./public/*
    send(req, url.parse(req.url).pathname)
        .root(path)
        .on('error', error)
        .on('directory', redirect)
        .pipe(res);
}).listen(port);
console.log('Web server startet on 127.0.0.1:' + port + ', serving static files from ./public directory.');