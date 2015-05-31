/**
 * Created by leon.li on 2015/5/4.
 */

var easyProxy = require("./lib/easyproxy.js");
var findHost = require("./lib/findhost.js");
var dirname = require('./lib/util').dirname;
var platform = require("./lib/platform");
var dns = require('dns');

var CONFIG = {
    "hostFilePath": null,
    "chromePath": null,
    "systemHostFilePath": platform.systemHostFilePath,
    "serverPort": 9393
}

function setConfig(name, value) {
    CONFIG[name] = value;
}


function startNode() {
    var logger = global.window.logger;

    logger.doLog("log", "node代码启动成功,端口：" + ( global.window.localStorage.getItem("serverPort") || 9393 ));

    var nwProxy = new easyProxy({
        port:  global.window.localStorage.getItem("serverPort") || 9393,
        onBeforeRequest: function(req) {
            try {
                var hostPath = global.window.localStorage.getItem("hostFilePath");
                var host = findHost(hostPath, req.host);
                var sysTemHost = findHost(CONFIG.systemHostFilePath, req.host);

                if (host) {
                    logger.doLog("log", req.host + "被代理到：" + host);
                    req.host = host;
                    req.replace = true;
                }
                if (sysTemHost && !host) {
                    req.needDnsResolve = true;
                    logger.doLog("warn", req.host + "检测到系统hosts并且被忽略");

                }
            }
            catch(e) {
                logger.doLog.doLog("error", e.message);
            }
        },
        onServerError: function(e) {
            logger.doLog("error", "serverError" + e.message);
        },
        onRequestError: function(e) {
            console.log(e.message);
        }
    });
    nwProxy.start();
}

var _cache = {};
function logHost( adress, ip, text, level ) {
    level = level || "log";
    if (!_cache[adress + level]) {
        _cache[adress + level] = [logInfo(level, adress + text + ip), 1];
    }
    else {
        _cache[adress + level][1] += 1;
        _cache[adress + level][0].innerHTML = '<i class="times">' + _cache[adress + level][1] + '</i>' + adress + text + ip;
    }
}

function logInfo(level, text) {
    var logWrapper = global.window.document.getElementById("log_area");
    var p = global.window.document.createElement('p');
    p.className = level;
    p.innerHTML = text;

    logWrapper.appendChild(p);
    return p;
}

function dnsTest(host) {
    if (typeof host != "string") {
        return;
    }
    dns.lookup(host, function onLookup(err, addresses, family) {
        if (err) {
            return;
        }
        var ip = addresses;
        dns.resolve(host, function onLookup(err, addresses, family) {
            if (err) {
                return;
            }
            var bool = true;
            addresses.forEach(function (item){
                if (item == ip) {
                    bool = false;
                    return;
                }
            });
            bool && logHost(host, ip, "被检测到可能配置了系统host：", "warn");
        });
    });
}
module.exports = {
    start: startNode,
    setConfig: setConfig
}

