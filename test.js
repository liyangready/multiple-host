var http = require("http");

http.createServer(function(req, res) {
    console.log("start");
    setTimeout(function() {
        console.log("end");
        res.end();
    }, 50000)
}).listen(3000);