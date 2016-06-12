var EventEmitter = require('events');
var util = require('util')
var Parser = require('./BLKMessage').Parser

var Log			= require('../lib/Log')
var moduleName = "Connection"
var logger = Log.create(moduleName, Log.WARN)

//
// Implements a msg channel - outputs streams of msg objects
// and can be asked to write a message object
// 
// implements the same event interface as socket or stream
//
//	EVENTS
//
//		"data" 		- 	raw data is available un parsed
//		"msg" 		-	a filly parsed BLKMessage is available
//		"msg_error"	-	a message parse error occured
//		"error"		-	error object 
//		"close"		-	the connection is closed
//
function Connection(socket_)
{
	this.AAname = "THISISANAME"
	var _self = this
	var socket = socket_
	this.socket = socket
	var fd = socket._handle.fd
	this.writePending = false

	socket.setEncoding('utf8');
	EventEmitter.call(this)
	// socket.pause()
	var msgBuffer = "";
	var parser = new Parser();

	parser.on("msg", (msg) => {
		logger(Log.DEBUG, "onparser:: msg", msg , " fd ", fd, socket._handle.fd, this.socket._handle.fd)
		_self.emit('data', msg, this)
	})
	
	parser.on('error', function(err){
		logger(Log.ERROR, "onparser error", err)
		_self.emit('error', err)
	})
	
	socket.on('data', function(data){
		logger(Log.DEBUG, ':ondata [' + data + "]");
		logger(Log.DEBUG, data.toString('utf8'))
		// socket.write(data.toString('utf8'))
		logger(Log.DEBUG, "onData", data.toString())
		msgBuffer += data.toString("utf8")
		parser.parse(data.toString('utf8'))

	})
	socket.on('drain', function(err){
		// ignore
		logger(Log.DEBUG,  "ondrain")
	})	
	socket.on('end', function(){
		logger(Log.DEBUG, "onend");
	})
	socket.on('close', function(){
		_self.emit('close', this)
		logger(Log.DEBUG, "onclose")
	})	
	socket.on('error', function(err){
		logger(Log.ERROR, err + "onerror")
		socket.destroy()
		_self.emit('error', err)
	})
	//
	// Write a Pixie message to the connections socket
	//
	// throw Error is there is already a write outstanding
	//
	this.write = function(msg, cb)
	{
		if( this.writePending ){
			logger(Log.DEBUG, "write a write is pending")
			throw new Error("cannot have a second write outstanding, must wait for previous to complete")
		}
		logger(Log.VERBOSE, util.inspect(msg.toString()))
		logger(Log.VERBOSE, util.inspect(msg))

		var res = socket.write(msg.toString(), ()=>{
			this.writePending = false
			if( cb != undefined && cb != null)
				cb()
		})
		if(  res == false ){
			this.writePending = true;
			logger(Log.VERBOSE, "returned non-zero - bufferSize : ", socket.bufferSize)
		} 
		return res
	}

	//
	// Start the connection
	//
	this.start = function()
	{
		socket.resume()
	}	

	//
	// Ends the connection - no more work for this socket
	//
	this.end = ()=>{
		socket.end()
	}
}

util.inherits(Connection, EventEmitter)

module.exports = exports = Connection;