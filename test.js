var exec = require("child_process").exec;
exec("nslookup qunarzz.com", {"encoding": 'utf-8'},function (err, stdout){
    var stdout = stdout.split('\r\n');
    if (stdout[4] && /Address|Addresses/.test(stdout[4])) {
        var len =  stdout.length;
        var resultIP;
        for (var i = 4; i < len; i++) {

            if ( /\d+\.\d+\.\d+\.\d+/.test(stdout[i]) ) {
                resultIP =  /\d+\.\d+\.\d+\.\d+/.exec(stdout[i])[0];
                console.log(resultIP)
                i = len;
            }

        }
    }
})