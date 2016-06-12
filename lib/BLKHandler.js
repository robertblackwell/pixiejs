var net = require('net')
var EventEmitter = require('events');
var util = require('util')
var Connection = require('./connection')

var Log			= require('./Log')
var moduleName = "BLKHandler"
var logger = Log.create(moduleName, Log.DEBUG)


//
// This class provides a context object for serving a single socket
//
function BLKHandler(socket_, hfunc_)
{
	var socket = socket_
	var handlerFunction = hfunc_
	var fd = socket._handle.fd
	var counter = 0

	conn = new Connection(socket)

	conn.on('close', (connection) =>{
	logger(Log.DEBUG, 'server got close nbr: ', counter)
		this.emit('close', this)
	})

	conn.on('error', function(err){
		logger(Log.ERROR, 'BLKHandler got connection error ')	

	})

	conn.on('data', function(msg, conn){
		logger(Log.DEBUG, "ondata fd: ", fd, " msg: ", msg, " conn.fd ", conn.socket._handle.fd)
		logger(Log.DEBUG, "ondata " + util.inspect(msg))
		
		var outMsg = handlerFunction(msg)
		logger(Log.DEBUG, "about to send output" + outMsg)
		conn.write(outMsg, ()=>{
			logger(Log.DEBUG, "sent output" + outMsg)
		})
		
		counter++
	})

	this.start = function(){
		conn.start()
	}
	this.cleanup = function(){
		socket = null
		fd = null
		handlerFunction = null
	}

}

util.inherits(BLKHandler, EventEmitter)

module.exports = exports = BLKHandler
