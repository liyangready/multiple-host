var platform = process.platform;
var output = {};

var path = require("path");
var execPath = path.dirname( process.execPath );

output.platform = /^win/.test(platform)? 'win' : /^darwin/.test(platform)? 'mac' : 'linux' + (process.arch == 'ia32' ? '32' : '64');

switch(output.platform) {
	case "win":
		output.systemHostFilePath = "C:\\Windows\\System32\\drivers\\etc\\hosts";
		output.defaultChromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";

		output.startChromeCommand = function() {
			var command;
			var localStorage = global.window.localStorage;

			var chromePath = localStorage.getItem("chromePath");
	        var port = localStorage.getItem("serverPort") || 9393;

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
	        return command;
		}
		
		output.dnsResolve = function() {

		}
	break;

	case "mac":
		output.systemHostFilePath = "/etc/hosts";
		output.defaultChromePath = "/Applications/Google\\ Chrome.app";

		output.startChromeCommand = function() {
			var localStorage = global.window.localStorage;
			var chromePath = localStorage.getItem("chromePath") || output.defaultChromePath;
	        var port = localStorage.getItem("serverPort") || 9393;
	        var devPath = path.join(execPath, "/chrome-dev");

			command = chromePath + '/Contents/MacOS/Google\\ Chrome' + ' --proxy-server="http://127.0.0.1:' + port + '"  --user-data-dir='+ devPath +'  --lang=local  http://wiki.corp.qunar.com/pages/viewpage.action?pageId=77931765';
			return command;
		}

		output.dnsResolve = function(hostName) {
			exec("host " + hostName, function(err, stdout) {

			});
		}


	break;

	case "linux64":
	output.systemHostFilePath = "/etc/hosts";
	break;
}

module.exports = output;