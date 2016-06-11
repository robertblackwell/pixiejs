var net 			= require('net')
var EventEmitter 	= require('events');
var util 			= require('util')
var process 		= require('process')
var BLKMessage 		= require('./lib/BLKMessage')

var BLK = require('./lib/blk')

var Log			= require('./lib/Log')
var moduleName = "server::handler_func"
var logger = Log.create(moduleName, Log.ERROR)



var handler = function(inMsg){
	logger(Log.WARN, "received ", util.inspect(inMsg))
	
	var outMsg = BLKMessage.createMessage(inMsg.destinationPort, inMsg.verb, inMsg.body);
	
	outMsg.setBody("Handler function Got this  : [" + inMsg.body + "]")
	logger(Log.WARN,  "sending ", util.inspect(outMsg))
	
	return outMsg;
}

console.log("Server starting on " + 8001)
var server = BLK.createServer(handler).listen(8001)
