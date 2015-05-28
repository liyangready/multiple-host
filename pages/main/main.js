/**
 * Created by leon.li on 2015/5/7.
 * 注意这页面里面的相对路径都是根目录
 */
var exec = require('child_process').exec;
var path = require("path");
var execPath = path.dirname( process.execPath );
var defaultHost = path.join(execPath , "/host.txt");
var detaultChrome = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
/*选择hosts文件*/
var hostBtn = document.getElementById("host_file");
var chromeFile = document.getElementById("chrome_file");
var hostLabel = document.getElementById("host_file_label");
var chromeLabel = document.getElementById("chrome_file_label");


//init
//hostLabel.innerHTML = hostBtn.defaultValue = localStorage.getItem("hostFilePath") || defaultHost;
//chromeLabel.innerHTML  = chromeFile.defaultValue = localStorage.getItem("chromePath") || detaultChrome;
//hostLabel.innerHTML = hostBtn.defaultValue || "未选择";
//chromeLabel.innerHTML = chromePath.defaultValue || "未选择";

//process.mainModule.exports.setConfig("hostFilePath", hostBtn.defaultValue);
//process.mainModule.exports.setConfig("chromePath", chromeFile.defaultValue);
//init
//hostBtn.addEventListener("change", function(event) {
//    if (!event.target.value) {
//        return;
//    }
//    localStorage.setItem("hostFilePath", event.target.value);
//    process.mainModule.exports.setConfig("hostFilePath", event.target.value);
//    hostLabel.innerHTML =  event.target.value;
//}, false);

//chromeFile.addEventListener("change", function(event) {
//    if (!event.target.value) {
//        return;
//    }
//    localStorage.setItem("chromePath", event.target.value);
//    process.mainModule.exports.setConfig("chromePath", event.target.value);
//    chromeLabel.innerHTML = event.target.value;
//}, false);



/*唤起chrome*/
var first = true;
var btn = document.getElementById("open_btn");
btn.addEventListener("click", function(event) {

    try {
        var command;

        var chromePath = localStorage.getItem("chromePath");
        if (chromePath) {
            var arr = chromePath.split('\\');
            var exeName = arr.pop();
            var devPath = path.join(execPath, "/chrome-dev");

            chromePath = arr.join('\\');

            command = 'start \/d "' + chromePath + '" ' + exeName + ' --proxy-server="localhost:9393"  --user-data-dir='+ devPath +'  --lang=local  http://wiki.corp.qunar.com/pages/viewpage.action?pageId=77931765';
        }
        else {
            command = 'start chrome --proxy-server="http://127.0.0.1:9393" --user-data-dir='+ devPath + ' --lang=local  http://wiki.corp.qunar.com/pages/viewpage.action?pageId=77931765';
        }
        console.log(command);
        exec(command, function (error) {

            if (error) {
                logger("log", error.message );
            }
            first && logger("log", "chrome启动成功，代理端口: 9393" );
            first = false;
        });
    } catch (err) {
        logger("error", "Error while trying to start child process: " + JSON.stringify(err) );
    }

}, false);

// Load native UI library
var gui = require('nw.gui');
var win = gui.Window.get();

// Listen to the minimize event
win.on('minimize', function() {
    // Create a tray icon
    var tray = new gui.Tray({ title: 'Tray', icon: 'image/icon.png' });

    // Give it a menu
    var menu = new gui.Menu();
    win.hide();
    menu.append(new gui.MenuItem({ label: '退出' }));
    menu.items[0].click = function() {
        gui.App.quit();
    };
    tray.menu = menu;

    tray.on("click", function() {
        win.show();
        win.resizeTo(650,500);
    })

});


