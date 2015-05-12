/**
 * Created by leon.li on 2015/5/7.
 * 注意这页面里面的相对路径都是根目录
 */
var exec = require('child_process').exec;

/*选择hosts文件*/
var hostBtn = document.getElementById("host_file");
var chromeFile = document.getElementById("chrome_file");
var chromePath;



hostBtn.addEventListener("change", function(event) {
    process.mainModule.exports.setConfig("hostFilePath", event.target.value);
}, false);

chromeFile.addEventListener("change", function(event) {
    process.mainModule.exports.setConfig("chromePath", event.target.value);
    chromePath = event.target.value;
}, false);



/*唤起chrome*/
var btn = document.getElementById("open_btn");
btn.addEventListener("click", function(event) {

    try {
        var command;
        if (chromePath) {
            var arr = chromePath.split('\\');
            var exeName = arr.pop();
            chromePath = arr.join('\\');
            command = 'start \/d "' + chromePath + '" ' + exeName + ' --proxy-server="localhost:9000"  --user-data-dir=D:/chrome-dev  --lang=local  http://wiki.corp.qunar.com/pages/viewpage.action?pageId=77931765';
        }
        else {
            command = 'start chrome --proxy-server="http://127.0.0.1:9000" --user-data-dir=D:/chrome-dev --lang=local  http://wiki.corp.qunar.com/pages/viewpage.action?pageId=77931765';
        }
        exec(command, function (error) {

            if (error) {
                logInfo("log", error.message );
            }
            logInfo("log", "chrome启动成功，代理端口: 9000" );
        });

    } catch (err) {
        logInfo("error", "Error while trying to start child process: " + JSON.stringify(err) );
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
        win.resizeTo(800,600);
    })

});

//
function logInfo(level, text) {
    var logWrapper = document.getElementById("log_area");
    var p = document.createElement('p');
    p.className = level;
    p.innerHTML = text;

    logWrapper.appendChild(p);
    return p;
}
