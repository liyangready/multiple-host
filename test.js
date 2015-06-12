var exec = require("child_process").exec;
var spawn = require("child_process").spawn;
var async = require("async");

var Sudo = require("node-webkit-sudo");
var sudo = new Sudo();
// sudo.setPassword("1993326");
// sudo.exec(["ls", "-lh"], function (err, data) {
//     console.log(data);
// });

var child = exec("sudo -k -S ls -lh", function (err, data) {
    console.log(data);
});
child.stderr.on("data", function(data) {
    console.log(111 + data);
    child.stdin.write("1993326\n")
})
 // var enableCommand = ['sudo networksetup -setwebproxy Ethernet 127.0.0.1 3000' ,
 //                                 // 'sudo networksetup -setwebproxy Wi-Fi 127.0.0.1 ' + port,
 //                                 // 'sudo networksetup -setwebproxystate Wi-Fi on',
 //                                 'sudo networksetup -ssetwebproxystate Ethernet on']
 //            async.eachSeries(enableCommand, function iterator(item, callback) {
 //                var child = exec(item, callback);
 //            }, function() {
 //                console.log("done");
 //            });