var http = require("http");
var net = require("net");
var url = require("url");
var dns = require("dns");
var exec = require("child_process").exec;

var _dnsCache = {
    "length": 0
};
var port ;

function easyProxy(options) {
    this.port = options.port || 9393;
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
    server.on("beforeRequest", this.onBeforeRequest);
    server.on("beforeResonse", this.onBeforeResonse);
    server.on("requestError", this.onRequestError);

    server.listen(this.port);
    port = this.port;
}

var lock = false;
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

        //check url
        if (requestOptions.host == "127.0.0.1" && requestOptions.port == port) {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.write("ok");
            res.end();
            return;
        }

        self.emit("beforeRequest", requestOptions);
        if ( requestOptions.needDnsResolve ) {
            //需要做dns解析的，先查询本地dns缓存
            console.log(requestOptions.host + ":" + requestOptions.port + "需要dns解析");
            if ( !_dnsCache[requestOptions.host] ) {
                //dns 超时控制
                var dnsTimeOut = 2000;
                var testTime = new Date();
                var lock = false;
                setTimeout(function() {
                    if (!lock) {
                        lock = true;
                        requestRemote( requestOptions, req, res, self);
                    }
                }, dnsTimeOut);

                exec("nslookup " +  requestOptions.host, function (err, stdout){
                    if (lock) { return; }
                    stdout = stdout.split('\r\n');
                    if (stdout[4] && /Address|Addresses/.test(stdout[4])) {
                        var len =  stdout.length;
                        var resultIP;
                        for (var i = 4; i < len; i++) {

                            if ( /\d+\.\d+\.\d+\.\d+/.test(stdout[i]) ) {
                                resultIP =  /\d+\.\d+\.\d+\.\d+/.exec(stdout[i])[0];
                                i = len;
                            }

                        }
                        _dnsCache[requestOptions.host] = resultIP;
                        _dnsCache["length"] += 1;
                        if (_dnsCache["length"] > 100) {
                            //防止内存占用太多
                            _dnsCache = {"length": 0};
                        }
                        console.log(requestOptions.host + ":" + requestOptions.port + "被解析到：" + resultIP + ",解析耗时" + (new Date() - testTime));

                        requestOptions.host = resultIP;

                    }
                    requestRemote( requestOptions, req, res, self);
                })
//                dns.resolve( requestOptions.host, function(err, addresses) {
//                    console.log(requestOptions.host + ":" + requestOptions.port + "解析耗时" + (new Date() - testTime));
//                    if (lock) { return; }
//                    if ( !err && addresses.length && !requestOptions.replace ) {
//                        lock = true;
//                        _dnsCache[requestOptions.host] = addresses[0];
//                        _dnsCache["length"] += 1;
//                        if (_dnsCache["length"] > 100) {
//                            //防止内存占用太多
//                            _dnsCache = {"length": 0};
//                        }
//
//                        requestOptions.host = addresses[0];
//                    }
//                    requestRemote( requestOptions, req, res, self);
//                });
            }
            else {
                //缓存命中
                console.log(requestOptions.host + ":" + requestOptions.port + "命中缓存");
                requestOptions.host  = _dnsCache[requestOptions.host];
                requestRemote( requestOptions, req, res, self);
            }
        }
        else {
            requestRemote( requestOptions, req, res, self);
        }



    } catch (e) {
        console.log("requestHandlerError" + e.message);
    }
    function requestRemote(requestOptions, req, res, proxy) {
        var remoteRequest = http.request(requestOptions, function(remoteResponse) {
            remoteResponse.headers['proxy-agent'] = 'NW Proxy 1.0';

            // write out headers to handle redirects
            res.writeHead(remoteResponse.statusCode, '', remoteResponse.headers);

            proxy.emit("beforeReponse", remoteResponse);
            remoteResponse.pipe(res);
            // Res could not write, but it could close connection
            res.pipe(remoteResponse);
        });

        remoteRequest.on('error', function(e) {
            proxy.emit("requestError", e, req, res);

            res.writeHead(502, 'Proxy fetch failed');
//            res.end();
//            remoteRequest.end();
        });

        req.pipe(remoteRequest);

        // Just in case if socket will be shutdown before http.request will connect
        // to the server.
        res.on('close', function() {
            remoteRequest.abort();
        });
    }

}

easyProxy.prototype.connectHandler = function(req, socket, head) {
    try {
        var self = this;

        var requestOptions = {
            host: req.url.split(':')[0],
            port: req.url.split(':')[1] || 443
        };

        self.emit("beforeRequest", requestOptions);

        if (requestOptions.needDnsResolve) {
            console.log(requestOptions.host + ":" + requestOptions.port + "需要dns解析");
            if ( !_dnsCache[requestOptions.host] ) {
                //dns 超时控制
                var dnsTimeOut = 2000;
                var lock = false;
                setTimeout(function() {
                    if (!lock) {
                        lock = true;
                        requestRemote( requestOptions, req, res, self);
                    }
                }, dnsTimeOut);

                exec("nslookup qunarzz.com", {"encoding": 'utf-8'},function (err, stdout){
                    var stdout = stdout.split('\r\n');
                    if (stdout[4] && /Address|Addresses/.test(stdout[4])) {
                        var len =  stdout.length;
                        var resultIP;
                        for (var i = 4; i < len; i++) {

                            if ( /\d+\.\d+\.\d+\.\d+/.test(stdout[i]) ) {
                                resultIP =  /\d+\.\d+\.\d+\.\d+/.exec(stdout[i])[0];
                                i = len;
                            }

                        }
                    }
                })
                dns.resolve( requestOptions.host, function(err, addresses) {
                    if (lock) { return; }
                    if ( !err && addresses.length && !requestOptions.replace ) {
                        lock = true;
                        _dnsCache[requestOptions.host] = addresses[0];
                        _dnsCache["length"] += 1;
                        if (_dnsCache["length"] > 100) {
                            //防止内存占用太多
                            _dnsCache = {"length": 0};
                        }

                        requestOptions.host = addresses[0];
                    }
                    connectRemote(requestOptions, socket);
                });
            }
            else {
                //缓存命中
                console.log(requestOptions.host + ":" + requestOptions.port + "命中缓存");
                requestOptions.host  = _dnsCache[requestOptions.host];
                connectRemote(requestOptions, socket);
            }
        }
        else {
            connectRemote(requestOptions, socket);
        }


        function ontargeterror(e) {
            console.log(req.url + " Tunnel error: " + e);
            _synReply(socket, 502, "Tunnel Error", {}, function() {
                socket.end();
            });
        }

        function connectRemote(requestOptions, socket) {
            var tunnel = net.createConnection(requestOptions, function() {
                _synReply(socket, 200, 'Connection established', {
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
        }
    } catch (e) {
        console.log("connectHandler error: " + e.message);
    }

}

function _synReply(socket, code, reason, headers, cb) {
    try {
        var statusLine = 'HTTP/1.1 ' + code + ' ' + reason + '\r\n';
        var headerLines = '';
        for (key in headers) {
            headerLines += key + ': ' + headers[key] + '\r\n';
        }
        socket.write(statusLine + headerLines + '\r\n', 'UTF-8', cb);
    } catch (error) {
        cb.call();
    }
}

module.exports = easyProxy;