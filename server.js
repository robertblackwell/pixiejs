#!/usr/bin/env node
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

var _port
var default_port = 8001

if( process.argv.length > 2 ){
	_port = parseInt(process.argv[2])
	if( isNaN(_port) )
		_port = default_port 
	logger(Log.ERROR, "First argument is " + _port + " type of " + typeof _port )
}else{
	_port = default_port;
}

console.log("Server starting on " + _port)
var server = BLK.createServer(handler).listen(_port)
