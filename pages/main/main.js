/**
 * Created by leon.li on 2015/5/7.
 * 注意这页面里面的相对路径都是根目录
 */
var exec = require('child_process').exec;
var path = require("path");
var execPath = path.dirname( process.execPath );
var defaultHost = path.join(execPath , "/host.txt");
/*选择hosts文件*/


/*唤起chrome*/
var first = true;
var btn = document.getElementById("open_btn");
btn.addEventListener("click", function(event) {

    try {
        var command;

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
        console.log(command);
        exec(command, function (error) {

            if (error) {
                logger.doLog("log", error.message );
            }
            first && logger.doLog("log", "chrome启动成功，代理端口: " + port );
            first = false;
        });
    } catch (err) {
        logger.doLog("error", "Error while trying to start child process: " + JSON.stringify(err) );
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
        win.resizeTo(760,600);
    })

});

$("#minify").on("click", function(e) {
    win.minimize();
});
$("#close").on("click", function(e) {
    win.close();
});

