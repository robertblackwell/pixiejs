var net = require('net')
var EventEmitter = require('events');
var util = require('util')
var Connection = require('./Connection')
var Handler = require('./BLKHandler')

var Log			= require('./Log')
var moduleName = "BLKServer"
var logger = Log.create(moduleName, Log.WARN)


//
// A class that implements a general server fromework for the Pixie protocol.
//
// On connection with a new client a Handler object is created to provide
// context for that client, but ... 
//
// The actual response to a request is constructed by the "handler" function,
// its signature is
//
//	function handler (
//		request_body_text,
//		response_boby_text	
//	)
//
//  In addition the server implements the following events as additional "hooks"
//
//	events
//	======
//
//		"close"	-	the server was closed
//		"error"	-	the server encoutered an unrecoverable error
//

function BLKServer(handler_)
{
	EventEmitter.call(this)
	var tcpserver = net.createServer()
	var connTable = [];

	logger(Log.DEBUG, "constructor ");
	tcpserver.on('close', function(){
		logger(Log.DEBUG, ' tcpserver on close ')
	})
	
	tcpserver.on('error', function(){
		logger(Log.ERROR, 'server got connection error ')		
	})
	
	tcpserver.on('connection', function(socket_)
	{
		var handler = new Handler(socket_, handler_)
		connTable.push(handler)		
		logger(Log.DEBUG, "onconnection");
		handler.on('close', (handler) =>{
			// logger(Log.DEBUG, "handler complete")
			var ix = connTable.indexOf(handler)
			connTable.splice(ix, 1)
			handler.cleanup()
			handler = null
			logger(Log.DEBUG, "handler on close - connTable count : " + connTable.length)
		})


		//
		handler.start()
	})
	this.listen = function(port){
		logger(Log.DEBUG, "Listen on port " + port + " tcpserver " + tcpserver);
		tcpserver.listen(port)
	}
}

util.inherits(BLKServer, EventEmitter)

module.exports = exports = BLKServer
