/**
 * 蛋疼的布局控制文件
 */
var fs = require("fs");
var platform = require("./lib/platform");

var ContentModel = Backbone.Model.extend();
var ContentView = Backbone.View.extend({
    "switchView": function() {
        var showViewClass = '.js-' + this.model.get("hashName");
        var toClass = ".js-to-" + this.model.get("hashName");
        $(".js-content").hide();
        $(showViewClass).show();

        $(".selected").removeClass("selected");
        $(toClass).addClass("selected");
    },
    "initialize": function() {

    }
});
var startModel = new ContentModel();
var logModel = new ContentModel();
var hostModel = new ContentModel();
var settingsModel = new ContentModel();

startModel.set({hashName: "start"});
logModel.set({hashName: "log"});
hostModel.set({hashName: "host"});
settingsModel.set({hashName: "settings"});

var StartView = ContentView.extend({
    "model": startModel,
    "el": $(".js-start")[0],
    "events": {
        "click .js-browser": "changeBrowser"
    },
    "changeBrowser": function(e) {
        var className = ".js-" + $(e.target).data("name");
        var $choose = $(className);

        this.$el.find(".choosed").removeClass("choosed");
        $(".js-detail").hide();
        $(e.target).addClass("choosed");
        $choose.show();
    }
});
var startView = new StartView();

var SettingsView = ContentView.extend({
    "model": settingsModel,
    "el": $(".js-settings")[0],
    "events": {
        "click #saveBtn": "saveSettings",
        "change .js-browser-path": "changeFile"
    },
    "saveSettings": function() {

        var port = this.$el.find("[name=serverPort]").val();
        var chromePath = this.$el.find(".js-chrome-path .js-showPath").val();
        var firefoxPath = this.$el.find(".js-firefox-path .js-showPath").val();

        if (parseInt(port, 10)) {
            localStorage.setItem("serverPort", port);
            process.mainModule.exports.setConfig("serverPort", port);
        }
        if (fs.existsSync(chromePath)) {
            localStorage.setItem("chromePath", chromePath);
            process.mainModule.exports.setConfig("chromePath", chromePath);
        }
        if (fs.existsSync(firefoxPath)) {
            localStorage.setItem("firefoxPath", firefoxPath);
            process.mainModule.exports.setConfig("firefoxPath", firefoxPath);
        }
        $(".popup-success").show().animate({
            top: "50%"
        }, 1000, function() {
            $(".popup-success").hide().css({
                top: "60%"
            });
        });

    },
    "changeFile": function(e) {
        
        var $show = $(e.target).siblings(".js-showPath");
        $show.val(e.target.value || "");
    },
    "render": function() {
        var port = localStorage.getItem("serverPort") || 9393;
        var chromePath = localStorage.getItem("chromePath") || platform.defaultChromePath;
        var firefoxPath = localStorage.getItem("firefoxPath") || platform.defaultFirefoxPath;

        this.$el.find("[name=serverPort]").val(port);
        this.$el.find(".js-chrome-path .js-showPath").val(chromePath);
        this.$el.find(".js-firefox-path .js-showPath").val(firefoxPath);

    }
});
var LogView = ContentView.extend({
    "model": logModel,
    "el": $(".js-log")[0],
    "events": {
        "click .js-clear-log": "clearLog",
        "input .js-filter-log": "filterLog"
    },
    "clearLog": function() {
        window.logger.clearLogger()
    },
    "filterLog": function(e) {
        window.logger.filterLogger(e.target.value);
    }

})
var logView = new LogView();
var hostView = new ContentView({"model": hostModel});
var settingsView = new SettingsView();

var AppRouter  = Backbone.Router.extend({
    routes: {
        "pages/start": "start",
        "pages/log": "log",
        "pages/host": "host",
        "pages/settings": "settings"
    },
    "initialize": function() {



    },
    "start": function() {
        startView.switchView();
    },
    "log": function() {
        logView.switchView();

    },
    "host": function() {
        hostView.switchView();
    },
    "settings": function() {
        settingsView.switchView();
        settingsView.render();
    }
});

var router = new AppRouter();
Backbone.history.start();

router.navigate("pages/start", {trigger: true, replace: true});
$(".js-to-start").addClass("selected");
