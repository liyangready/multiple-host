/**
 * Created by leon.li on 2015/5/11.
 */
var fs = require("fs");

function findHost(hostsPath, hostName) {
    if (!hostsPath || !hostName) {return false;}
    var ipMap = _parse(hostsPath);
    var hostMap = _convert(ipMap);

    return hostMap[hostName] ? hostMap[hostName] : false;
}

function _parse(hostsPath) {
    var rt = [];
    var content = fs.existsSync(hostsPath) ? fs.readFileSync(hostsPath, "utf-8").trim().split(/\r?\n/): [];
    content.forEach(function(item, index){
        item = item.replace(/\#.*/g, '').trim();

        var hostObj = {};
        var hostArr = item.split(/\s+/g);

        var key = hostArr[0];
        var value = hostArr.splice(0, 1) && hostArr;

        if ( key != '' && value.length ) {
            hostObj[key] = value;
            rt.push(hostObj)
        }
    });
    return rt;
}

function _convert(ipMap) {
    var rt = {};
    ipMap.forEach(function (hostObj, index){
        for (var ip in hostObj) {
            var hostArr = hostObj[ip];
            hostArr.forEach(function (host, index){
                rt[host] = ip;
            })
        }
    });
    return rt;
}

//console.log(findHost("./test.txt",'www.qunar.com'));
module.exports = findHost;