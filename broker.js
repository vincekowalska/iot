var mosca = require('mosca');
var fs = require('fs');
var settings = {
    port: 1883
}

var server = new mosca.Server(settings);

server.on('ready', function() {
    console.log("ready");
});


server.on('published', (packet)=>{
    message = packet.payload.toString()
    console.log(message)

    var logFile = 'broker.log';

    fs.appendFile(logFile, message + '\n', (err) => {
        if (err) throw err;
        console.log('Message logged');
    })
});

