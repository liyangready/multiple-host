/**
 * Created by leon.li on 2015/5/4.
 */

var easyProxy = require("./lib/easyproxy.js");
var findHost = require("./lib/findhost.js");
var dirname = require('./lib/util').dirname;
var dns = require('dns');


var CONFIG = {
    "hostFilePath": null,
    "chromePath": null
}

function setConfig(name, value) {
    CONFIG[name] = value;
}


function startNode() {
    logInfo("log", "node代码启动成功");

    var nwProxy = new easyProxy({
        port: 9000,
        onBeforeRequest: function(req) {
            try {
                var host = findHost(CONFIG.hostFilePath, req.host);
                dnsTest(req.host);

                if (host) {
                    logHost(req.host, host, "被代理到：");
                    req.host = host;
                }
            }
            catch(e) {
                logInfo("error", e.message);
            }
        },
        onServerError: function(e) {
            logInfo("error", "serverError" + e.message);
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
    if (!_cache[adress]) {
        _cache[adress] = [logInfo(level, adress + text + ip), 1];
    }
    else {
        _cache[adress][1] += 1;
        _cache[adress][0].innerHTML = '<i class="times">' + _cache[adress][1] + '</i>' + adress + text + ip;
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

