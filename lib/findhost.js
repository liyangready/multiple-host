/**
 * Created by leon.li on 2015/5/11.
 */
var fs = require("fs");

function findHost(hostsPath, hostName) {
    var hostMap;
    if (!hostsPath || !hostName) {return false;}
    if (typeof hostsPath === 'object') {
        hostMap = _getHostMap(hostsPath);
    } else {
        var ipMap = _parse(hostsPath);
        hostMap = _convert(ipMap);
    }
    var findIp = _findIp(hostName, hostMap);
    return findIp;
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

function _getHostMap(state) {
    //{currentEnvName:'xx', envs:[]}
    if (!state || !state.envs || !state.currentEnvName) {return {}}
    var currentEnvName = state.currentEnvName;
    var envs = state.envs;
    var currentEnv;
    envs.forEach(function(env) {
        if (env.name === currentEnvName) {
            currentEnv = env;
        }
    });
    var hostMap = {};
    currentEnv.renderList.forEach(function(group) {
        group.items.forEach(function(line) {
            !hostMap[line.host] &&
            line.used &&
            (hostMap[line.host] = line.ip);
        })
    })
    return hostMap;
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

function _findIp(hostName, hostMap) {
    if (hostMap[hostName]) {
        return hostMap[hostName];
    }
    //临时增加通配符 *.xxx.com

    for (var i in hostMap) {
        var oldHost = i;
        var hostArr1 = oldHost.split('.');
        var hostArr2 = hostName.split('.');
        var index = hostArr1.indexOf('*');
        if ( index >= 0 && hostArr1.length === hostArr2.length) {
            hostArr1.splice(index, 1);
            hostArr2.splice(index, 1);
            if ( hostArr1.join('.') === hostArr2.join('.') ) {
                return hostMap[oldHost];
            }
        }
    }
    return false;
}
//console.log(findHost("./test.txt",'www.qunar.com'));
module.exports = findHost;