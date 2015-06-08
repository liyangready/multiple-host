/**
 * Created by leon.li on 2015/5/14.
 */
var gui = require('nw.gui');
var copyPath, execPath;
if(gui.App.argv.length){
    copyPath = gui.App.argv[0];
    execPath = gui.App.argv[1];
}
//download new version of app in tmp
//unpack
//run updater
//updater will copy itself to origin directory
//updater will run app
var pkg = require('./package.json');
var request = require('request');
var url = require('url');
var path = require('path');
var os = require('os');
var fs = require('fs');
var k = 0;
var d = false;
var updater = require('./lib/updater.js');
var upd = new updater(pkg);
var tryingForNewVersion = false;

//for test purposes

    if(!copyPath){
        request.get(url.resolve(pkg.manifestUrl, '/version/'+ pkg.version));
        document.getElementById('version').innerHTML = '当前版本 ' + pkg.version;
        if(!d) {
            upd.checkNewVersion(versionChecked);
        }
    } else {
        document.getElementById('version').innerHTML = '已打开最新版本';
        //copy hosts file
        var hostFilePath = localStorage.getItem("hostFilePath");
        var hostContent = hostFilePath && fs.readFileSync(hostFilePath);
        upd.install(copyPath, newAppInstalled);

        function newAppInstalled(err){
            if(err){
                console.log(err);
                return;
            }
            if (hostContent && hostFilePath) {
                fs.writeFileSync(hostFilePath, hostContent);
            }
            //upd.run(execPath, null);
            //gui.App.quit();
        }
    }


function versionChecked(err, newVersionExists, manifest){

    if(err){
        console.log(err);
        return Error(err);
    }
    else if(d){
        console.log('Already downloading');
        return;
    }
    else if(!newVersionExists){
        console.log('No new version exists');
        return;
    }
    setTimeout(function() {
        //mac如果同步有秒退现象
        var rt = confirm("检测到有新版本,是否更新?");

        if (!rt) {
            return;
        }
        document.getElementById("loading_wrapper").style.display = "block";

        var loaded = 0;
        var newVersion = upd.download(function(error, filename){
            d = true;
            newVersionDownloaded(error, filename, manifest);
        }, manifest);
        newVersion.on('data', function(chunk){
            loaded+=chunk.length;
            document.getElementById('loaded').innerHTML = Math.floor(loaded / newVersion['content-length'] * 100) + '%';
        })
    }, 1000);

}
function newVersionDownloaded(err, filename, manifest){

    if(err){
        console.log(err)
        return Error(err);
    }
    document.getElementById('loaded').innerHTML = "解压中" ;
    upd.unpack(filename, newVersionUnpacked, manifest);
}
function newVersionUnpacked(err, newAppPath){

    if(err){
        console.log(err)
        return Error(err);
    }
    document.getElementById('loaded').innerHTML = "重启中" ;
    var runner = upd.runInstaller(newAppPath, [upd.getAppPath(), upd.getAppExec()]);
    gui.App.quit();
}