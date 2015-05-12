var http = require("http");
var net = require("net");
var url = require("url");

function easyProxy(options) {
    this.port = options.port || 9000;

    this.onServerError = options.onServerError || function() {};
    this.onBeforeRequest = options.onBeforeRequest || function() {};
    this.onBeforeResonse = options.onBeforeResonse || function() {};
    this.onRequestError = options.onRequestError || function() {};
}
easyProxy.prototype.start = function() {
    var server = http.createServer();

    server.on("request", this.requestHandler);
    server.on("connect", this.connectHandler);

    server.on("error", this.onServerError);
    server.on("beforeRequset", this.onBeforeRequest);
    server.on("beforeResonse", this.onBeforeResonse);
    server.on("requestError", this.onRequestError);

    server.listen(this.port);
}


easyProxy.prototype.requestHandler = function(req, res) {
    try {
        var self = this; // this -> server
        var path = req.headers.path || url.parse(req.url).path;
        var requestOptions = {
            host: req.headers.host.split(':')[0],
            port: req.headers.host.split(':')[1] || 80,
            path: path,
            method: req.method,
            headers: req.headers
        };

        if (requestOptions.host == "127.0.0.1" && requestOptions.port == "9000") {
            res.writeHead(200, { 'Content-Type': 'text/plain'});
            res.write("ok");
            res.end();
            return;
        }

        self.emit("beforeRequset", requestOptions);

        var remoteRequest = http.request(requestOptions, function(remoteResponse) {
            remoteResponse.headers['proxy-agent'] = 'NW Proxy 1.0';

            // write out headers to handle redirects
            res.writeHead(remoteResponse.statusCode, '', remoteResponse.headers);

            self.emit("beforeReponse", remoteResponse);
            remoteResponse.pipe(res);

            // Res could not write, but it could close connection
            res.pipe(remoteResponse);
        });

        remoteRequest.on('error', function(e) {
            self.emit("requestError", e, req, res);

            res.writeHead(502, 'Proxy fetch failed');
            res.end();
        });

        req.pipe(remoteRequest);

        // Just in case if socket will be shutdown before http.request will connect
        // to the server.
        res.on('close', function() {
            remoteRequest.abort();
        });
    }
    catch(e) {
        console.log("requestHandlerError" + e.message);
    }

}

easyProxy.prototype.connectHandler = function(req, socket, head) {
    try {
        var self = this;

        var requestOptions = {
            host: req.url.split(':')[0],
            port: req.url.split(':')[1] || 443
        };

        self.emit("beforeRequst", requestOptions);

        var tunnel = net.createConnection(requestOptions, function() {
            _synReply(socket, 200, 'Connection established',
                {
                    'Connection': 'keep-alive',
                    'Proxy-Agent': 'NW Proxy 1.0'
                },
                function() {
                    tunnel.pipe(socket);
                    socket.pipe(tunnel);
                }
            );
        });

        tunnel.setNoDelay(true);

        tunnel.on('error', ontargeterror);

        function ontargeterror(e) {
            console.log(req.url + " Tunnel error: " + e );
            _synReply(socket, 502, "Tunnel Error", {}, function() {
                socket.end();
            });
        }
    }
    catch(e) {
        console.log("connectHandler error: " + e.message);
    }

 }

function _synReply(socket, code, reason, headers, cb) {
    try {
        var statusLine = 'HTTP/1.1 ' + code + ' ' + reason + '\r\n';
        var headerLines = '';
        for(key in headers){
            headerLines += key + ': ' + headers[key] + '\r\n';
        }
        socket.write(statusLine + headerLines + '\r\n', 'UTF-8', cb);
    } catch(error) {
        cb.call();
    }
}

module.exports = easyProxy;