/**
 * Created by leon.li on 2015/5/7.
 * 注意这页面里面的相对路径都是根目录
 */
var exec = require('child_process').exec;
var path = require("path");
var platform = require("./lib/platform");


//取消拖拽默认事件
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
// mac menu
if (platform.platform == "mac") {
    var nativeMenuBar = new gui.Menu({ type: "menubar" });
    nativeMenuBar.createMacBuiltin("My App");
    win.menu = nativeMenuBar;
}

// Listen to the minimize event
win.on('minimize', function() {

    if ( localStorage.getItem("minifySetting") == "true" ) { //localstorage 会将 true转换成 "true"
        // Create a tray icon
        var tray = new gui.Tray({ title: 'Tray', icon: 'image/icon.png' });

        // Give it a menu
        var menu = new gui.Menu();
        win.hide(); //最小化到托盘
        menu.append(new gui.MenuItem({ label: '退出' }));
        menu.items[0].click = function() {
            gui.App.quit();
        };
        tray.menu = menu;

        tray.on("click", function() {

            win.show();
            win.resizeTo(760,600);
            this.remove();
            tary = null;
        })
    }
});
win.on("restore", function() {
    win.resizeTo(760,600);
});

$("#minify").on("click", function(e) {
    win.minimize();
});
$("#close").on("click", function(e) {
    win.hide();
    win.close();
});
$("#alwaysOnTop").on("click", function(e){
    if ($(this).hasClass("ontop-select")) {
        $(this).removeClass("ontop-select");
        win.setAlwaysOnTop(false);
    }
   else {
        $(this).addClass("ontop-select");
        win.setAlwaysOnTop(true);
    }
});