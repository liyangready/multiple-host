/*
*蛋疼的兼容文件
* */
var platform = process.platform;
var fs = require("fs");
var output = {};
var dns = require("dns");
var exec = require("child_process").exec;
var async = require("async");
var path = require("path");
var _dnsCache = {
    "length": 0
}
var execPath = path.dirname( process.execPath );

output.platform = /^win/.test(platform)? 'win' : /^darwin/.test(platform)? 'mac' : 'linux' + (process.arch == 'ia32' ? '32' : '64');

switch(output.platform) {
	case "win":
        var programFile = process.arch == 'x64' ? "C:\\Program Files (x86)\\" : "C:\\Program Files\\";

		output.systemHostFilePath = "C:\\Windows\\System32\\drivers\\etc\\hosts";
		output.defaultChromePath = programFile + "Google\\Chrome\\Application\\chrome.exe";
        output.defaultFirefoxPath = programFile + "Mozilla Firefox\\firefox.exe";
		output.startChrome = function(cb) {
			var command;
			var localStorage = global.window.localStorage;
			var chromePath = localStorage.getItem("chromePath") || output.defaultChromePath;
	        var port = localStorage.getItem("serverPort") || 9393;

            if (!fs.existsSync(chromePath)) {
                global.window.alert(chromePath + "文件不存在，请检查设置中的chrome安装路径");
                cb({message: "文件不存在"});
                return;
            }
            if (/[\u4E00-\u9FFF]/.test(chromePath)) {
                global.window.alert("存在中文路径，无法启动");
                cb({message: "存在中文路径"});
                return;
            }
	        if (chromePath) {
	            var arr = chromePath.split('\\');
	            var exeName = arr.pop();
	            var devPath = path.join(execPath, "/chrome-dev");

	            chromePath = arr.join('\\');

	            command = 'start \/d "' + chromePath + '" ' + exeName + ' --proxy-server="http://127.0.0.1:' + port +'"  --user-data-dir='+ devPath +'  --lang=local  http://wiki.corp.qunar.com/pages/viewpage.action?pageId=77931765';
	        }
	        else {
	            command = 'start chrome --proxy-server="http://127.0.0.1:' + port + '" --user-data-dir='+ devPath + ' --lang=local  http://wiki.corp.qunar.com/pages/viewpage.action?pageId=77931765';
	        }
            console.log(command);
            exec(command, cb);
		}

        output.startFirefox = function(cb) {
            // use firefox_proxy.bat in tools

            var localStorage = global.window.localStorage;
            var firefoxPath = localStorage.getItem("firefoxPath") || output.defaultFirefoxPath;
            var port = localStorage.getItem("serverPort") || 9393;
            var batPath =  path.resolve(__dirname, 'tools/firefox_proxy.bat');
            // change bat file
            if (!fs.existsSync(firefoxPath)) {
                global.window.alert(firefoxPath + "文件不存在，请检查设置中的firefox安装路径");
                cb({message: "文件不存在"});
                return;
            }
            if (/[\u4E00-\u9FFF]/.test(firefoxPath)) {
                global.window.alert("存在中文路径，无法启动");
                cb({message: "存在中文路径"});
                return;
            }
            var temArr =  firefoxPath.split("\\");
            var firefoxDir = firefoxPath && temArr.pop() && temArr.join("\\");
            var content = fs.readFileSync(batPath, {encoding: "utf-8"});
            content = content.replace(/port=\w*/,"port=" + port);
            content = content.replace(/ffdir=.*/,"ffdir=" + firefoxDir);

            fs.writeFileSync(batPath ,content, {encoding: "utf-8"});
            var command =  batPath;
            console.log(command);
            exec(command, cb);
        }

        output.setSystemProxy = function(cb) {
            //enable
            var localStorage = global.window.localStorage;
            var port = localStorage.getItem("serverPort") || 9393;
            var enableCmd = 'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" ^ /v ProxyEnable /t REG_DWORD /d 1 /f';
            var changeAddress = 'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" ^/v ProxyServer /t REG_SZ /d 127.0.0.1:' + port + ' /f';
            exec(changeAddress, function(err) {
               if (err) {
                   console.log(err);
               }
               else {
                   exec(enableCmd, cb);
               }
            });
        }
        output.disableSystemProxy = function(cb) {
            var disableCmd = 'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" ^ /v ProxyEnable /t REG_DWORD /d 0 /f';
            exec(disableCmd, cb);
        }
	break;

	case "mac":
		output.systemHostFilePath = "/etc/hosts";
        output.defaultChromePath = "/Applications/Google\\ Chrome.app";
        output.defaultFirefoxPath = "/Applications/Firefox.app";

		output.startChrome = function(cb) {
			var localStorage = global.window.localStorage;
			var chromePath = localStorage.getItem("chromePath") || output.defaultChromePath;
	        var port = localStorage.getItem("serverPort") || 9393;
	        var devPath = path.join(execPath, "/chrome-dev");

            command = chromePath + '/Contents/MacOS/Google\\ Chrome' + ' --proxy-server="http://127.0.0.1:' + port + '"  --user-data-dir='+ devPath +'  --lang=local  http://wiki.corp.qunar.com/pages/viewpage.action?pageId=77931765';
            console.log(command);
            exec(command, cb);
		}

        output.startFirefox = function(cb) {
            var localStorage = global.window.localStorage;
            var firefoxPath = localStorage.getItem("firefoxPath") || output.defaultFirefoxPath;
            firefoxPath = firefoxPath + "/Contents/MacOS/firefox";
            //create profile
            exec(firefoxPath + " -CreateProfile ff_dev", function(err) {
                var profilePath = "";
                if (err) {
                    cb(err);
                    return;
                }
                //add proxy settings
                // may be in one of these dir : http://kb.mozillazine.org/Profile_folder_-_Firefox
                if (fs.existsSync(process.env.HOME + "/Library/Application Support/Firefox/Profiles/")) {
                    profilePath = process.env.HOME + "/Library/Application Support/Firefox/Profiles/";
                }
                else if (fs.existsSync(process.env.HOME + "/Library/Mozilla/Firefox/Profiles/")) {
                    profilePath = process.env.HOME + "/Library/Mozilla/Firefox/Profiles/";
                }

                var port = localStorage.getItem("serverPort") || 9393;
                var arr = fs.readdirSync(profilePath);
                var proxyStr = 'user_pref("network.proxy.http", "127.0.0.1 ");\nuser_pref("network.proxy.http_port", ' + port + ');\nuser_pref("network.proxy.type", 1);\n';
                arr.forEach(function(item){
                   if (/ff_dev/.test(item)) {
                       fs.appendFileSync(profilePath + item + '/prefs.js', proxyStr)
                   }
                });

                command = firefoxPath + ' -P ff_dev -no-remote'+ ' http://wiki.corp.qunar.com/pages/viewpage.action?pageId=77931765';
                console.log(command);
                exec(command, cb);
            });
            


        }

        output.sudoPassword = '';
       
        output.setSystemProxy = function(cb) {
            
            var sudoPassword = output.sudoPassword || global.window.prompt("password for sudo");
            
            var port = global.window.localStorage.getItem("serverPort") || 9393;
            var enableCommand = [
                                'networksetup -setwebproxy Ethernet 127.0.0.1 ' + port,
                                'networksetup -setsecurewebproxy Ethernet 127.0.0.1 ' + port,
                                'networksetup -setsecurewebproxystate Ethernet on',
                                 // 'networksetup -setwebproxy Wi-Fi 127.0.0.1 ' + port,
                                 // 'networksetup -setwebproxystate Wi-Fi on',
                                 'networksetup -setwebproxystate Ethernet on'];
            enableCommand = "sudo -k -S -s -- '" + enableCommand.join(";") + "'" ;
            var child = exec(enableCommand, function(err) {
                if (!err) {
                    output.sudoPassword  = sudoPassword;
                }
                cb(err);
                
            }); //黑科技
            child.stderr.on("data", function(data) {
                child.stdin.write(sudoPassword + "\n");
            });
        

        }
        output.disableSystemProxy = function(cb) {
            var disableCommand = [
                                  //'sudo networksetup -setwebproxystate Wi-Fi off',
                                  'networksetup -setsecurewebproxystate Ethernet off',
                                  'networksetup -setwebproxystate Ethernet off'];
            disableCommand = "sudo -k -S -s -- '" + disableCommand.join(";") + "'" ;
            var child = exec(disableCommand, cb); //黑科技
            child.stderr.on("data", function(data) {
                child.stdin.write(output.sudoPassword + "\n");
            });
        }
     break;
	case "linux64":
	output.systemHostFilePath = "/etc/hosts";
	break;
}

output.doDns = function(host, port, cb) {
    if ( !_dnsCache[host] ) {
        //mac host
        var dnsTimeOut = 5000;
        var testTime = new Date();
        var lock = false;
        var timeout = setTimeout(function() {
            if (!lock) {
                lock = true;
                global.window.logger.doLog("warn", host + "dns解析超时");
                cb("timeout");
            }
        }, dnsTimeOut);
        getIP(host, function(err, resultIP) {
            clearTimeout(timeout);
            if (err) {
                cb(err);
            }
            if (resultIP) {
                _dnsCache[host] = resultIP;
                _dnsCache["length"] += 1;
                if (_dnsCache["length"] > 100) {
                    //防止内存占用太多
                    _dnsCache = {"length": 0};
                }
                console.log(host + ":" + port + "被解析到：" + resultIP + ",解析耗时" + (new Date() - testTime));
            }
            if (lock) { //已经超时
                return;
            }
            lock = true;
            cb(null, resultIP);
            global.window.logger.doLog("warn", host + "检测到系统hosts并且被忽略");

        });
    }
    else {
        //缓存命中
        global.window.logger.doLog("warn", host + "检测到系统hosts并且被忽略");
        console.log(host + ":" + port + "命中缓存:" +  _dnsCache[host]);
        cb && cb(null, _dnsCache[host]);
    }
}
function getIP(host, cb) {

    if (output.platform == "win") {
        exec("nslookup " +  host, function (err, stdout){
            if (err) { cb(err); }
            var resultIP;
            stdout = stdout.split(/\r?\n/);
            if (stdout[4] && /Address|Addresses/.test(stdout[4])) {
                var len =  stdout.length;
                for (var i = 4; i < len; i++) {
                    if ( /\d+\.\d+\.\d+\.\d+/.test(stdout[i]) ) {
                        resultIP =  /\d+\.\d+\.\d+\.\d+/.exec(stdout[i])[0];
                        i = len;
                    }
                }
            }
            if (resultIP) {
                cb(null, resultIP);
            }
        });
    }
    else if (output.platform == "mac") {
        // dns.resolve(host, function(err, result) {
        //     if (err) { cb(err); }
        //     cb(null, result[0]);
        // });
    
       exec("host " + host, function (err, stdout){
           if (err) { cb(err); }
           var resultIP;
           stdout = stdout.split('\n');
           for ( var i=0; i< stdout.length; i++) {
               if ( /\d+\.\d+\.\d+\.\d+/.test(stdout[i]) ) {
                   resultIP =  /\d+\.\d+\.\d+\.\d+/.exec(stdout[i])[0];
                   i = stdout.length;
               }
           }
           if (resultIP) {
               cb(null, resultIP);
           }
       });
    }
}

module.exports = output;