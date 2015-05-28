(function(){

    var config = {
        chrome : 'start chrome --proxy-server="localhost:3128"'
    }

    var exec = require('child_process').exec;
    var last = exec('dir');

    last.stdout.on('data', function(data){
        console.log('标准输出：' + data);
    });

    last.on('exit', function (code) {
        console.log('子进程已关闭，代码：' + code);
    });
})();

define(function(require, exports, module) {




});