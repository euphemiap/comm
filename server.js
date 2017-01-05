var liveServer = require("live-server");
 
var params = {
    port: 3000, 
    host: "0.0.0.0", 
    root: "./", 
    open: true, 
    ignore: 'scss,my/templates', 
    file: "index.html", 
    wait: 1000,  
    mount: [['/components', './node_modules']], 
    logLevel: 2, 
    middleware: [function(req, res, next) { next(); }] 
};

liveServer.start(params);

/*var serialport = require('serialport');
var portName = '/dev/tty.usbmodem1411';
var sp = new serialport.SerialPort(portName, {
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    parser: serialport.parsers.readline("\r\n")
});

sp.on('data', function(input) {
    console.log(input);
});*/
