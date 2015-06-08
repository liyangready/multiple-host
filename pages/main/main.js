/**
 * Created by leon.li on 2015/5/7.
 * 注意这页面里面的相对路径都是根目录
 */
var exec = require('child_process').exec;
var path = require("path");
var execPath = path.dirname( process.execPath );
/*选择hosts文件*/
var platform = require("./lib/platform");

/*唤起chrome*/
var first = true;
var btn = document.getElementById("open_btn");
btn.addEventListener("click", function(event) {

    try {

        var port = localStorage.getItem("serverPort") || 9393;
        
        platform.startChrome(function(error) {
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

/*唤起firefox*/
var first = true;
var btn = document.getElementById("open_firefox");
btn.addEventListener("click", function(event) {

    try {

        var port = localStorage.getItem("serverPort") || 9393;

        platform.startFirefox(function(error) {
            if (error) {
                logger.doLog("log", error.message );
            }
            first && logger.doLog("log", "firefox启动成功，代理端口: " + port );
            first = false;
        });


    } catch (err) {
        logger.doLog("error", "Error while trying to start child process: " + JSON.stringify(err) );
    }

}, false);
/*唤起firefox*/

/*更改系统设置*/
var btn = document.getElementById("change_system_proxy");
btn.addEventListener("click", function(event) {
    var $target = $(event.target);
    try {
        var port = localStorage.getItem("serverPort") || 9393;

        if (platform.platform == "mac") {
            alert("mac用户请自行设置系统代理");
        }
        if ($target.hasClass("open_btn")) {
            platform.setSystemProxy(function(error) {
                if (error) {
                    logger.doLog("log", error.message );
                }
                logger.doLog("log", "系统代理设置成功，代理端口: " + port );
                $target.removeClass("open_btn").addClass("close_btn").html("关闭系统代理<br/>(重启浏览器生效)");
            });
        }
        else {
            platform.disableSystemProxy(function(error) {
                if (error) {
                    logger.doLog("log", error.message );
                }
                logger.doLog("log", "系统代理关闭成功 ");
                $target.removeClass("close_btn").addClass("open_btn").html("打开系统代理<br/>(重启浏览器生效)");
            });
        }
    } catch (err) {
        logger.doLog("error", "Error while trying to start child process: " + JSON.stringify(err) );
    }

}, false);

$(document).on({
    dragleave:function(e){
        e.preventDefault();
    },
    drop:function(e){
        e.preventDefault();
    },
    dragenter:function(e){
        e.preventDefault();
    },
    dragover:function(e){
        e.preventDefault();
    }
});

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

