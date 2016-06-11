var EventEmitter = require('events');
var util = require('util')
var Parser = require('./BLKMessage').Parser
var Logger = require('./Logger')

Logger.setDisable()
//
// Implements a msg channel - outputs streams of msg objects
// and can be asked to write a message object
// 
// implements the same event interface as socket or stream
//
function Connection(socket_)
{
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
		Logger.log("connection::onparser:: msg", msg , " fd ", fd, socket._handle.fd, this.socket._handle.fd)
		_self.emit('data', msg.body, this)
	})
	
	parser.on('error', function(err){
		console.log("connection::onparser error", err)
	})
	
	socket.on('data', function(data){
		Logger.log('connection::ondata fd: ', fd, data);
		// Logger.log(data.toString('utf8'))
		// socket.write(data.toString('utf8'))
		// Logger.log("connection::onData", data.toString())
		msgBuffer += data.toString("utf8")
		parser.parse(data.toString('utf8'))

	})
	socket.on('drain', function(err){
		// ignore
		Logger.log(err, "connection error")
	})	
	socket.on('end', function(){
		Logger.log("connection end");
	})
	socket.on('close', function(){
		_self.emit('close', this)
		Logger.log("connection close")
	})	
	socket.on('error', function(err){
		console.log(err, "connection error")
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
			Logger.error("connection::write a write is pending")
			throw new Error("cannot have a second write outstanding, must wait for previous to complete")
		}

		var res = socket.write(msg.toString(), ()=>{
			this.writePending = false
			if( cb != undefined && cb != null)
				cb()
		})
		if(  res == false ){
			this.writePending = true;
			// Logger.error("Connection::write returned non-zero - bufferSize : ", socket.bufferSize)
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