/**
 * Created by leon.li on 2015/5/25.
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
        var className = ".js-" + e.target.innerHTML;
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
        "change #chrome_file": "changeFile"
    },
    "saveSettings": function() {

        var port = this.$el.find("[name=serverPort]").val();
        var path = this.$el.find("#showPath").val();

        if (parseInt(port, 10)) {
            localStorage.setItem("serverPort", port);
            process.mainModule.exports.setConfig("serverPort", port);
        }
        if (fs.existsSync(path)) {
            localStorage.setItem("chromePath", path);
            process.mainModule.exports.setConfig("chromePath", path);
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
        
        var $show = this.$el.find("#showPath");
        $show.val(e.target.value || "");
    },
    "render": function() {
        var port = localStorage.getItem("serverPort") || 9393;
        var path = localStorage.getItem("chromePath") || platform.defaultChromePath;

        this.$el.find("[name=serverPort]").val(port);
        this.$el.find("#showPath").val(path);
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
