/**
 * Created by leon.li on 2015/5/25.
 */
var ContentModel = Backbone.Model.extend();
var ContentView = Backbone.View.extend({
    "switchView": function() {
        var showViewClass = '.js-' + this.model.get("hashName");
        $(".js-content").hide();
        $(showViewClass).show();
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

var startView = new ContentView({"model": startModel});
var logView = new ContentView({"model": logModel});
var hostView = new ContentView({"model": hostModel});
var settingsView = new ContentView({"model": settingsModel});

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
    }
});

var router = new AppRouter();
Backbone.history.start();

router.navigate("pages/start", {trigger: true, replace: true});

