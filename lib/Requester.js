"use strict";
var EventEmitter = require('events')
var process 	= require('process')
var Statistics  = require('./Stats')
var net 		= require('net')
var util 		= require('util')
var net 		= require('net')

var Connection 	= require("./connection")
var BLKMessage 	= require("./BLKMessage")
var Logger 		= require("./Logger")
Logger.setDisable()

//
// This class implements sending a BLKMessage request to a server
// and waiting for the response
//
// Exposes 2 methods
//
//	-	connect() 	
//			establishes the connection with the server,
//			fires 'connect' event when complete
//
//	-	send(message_text, cb)
//			wrap the message_text in a protocol envelope and sends
//			it to the sever. Waits for a reply. Once reply is available
//			'cb' is called and 'data' event is fired. In both cases
//			the response message body text is passed to the eventHandler
//			of 'cb'
// 			
//			A single instance of a Requester can 'send' multiple requests,
//			but a second request cannot be sent until the prior one is answered
//
function Requester(port)
{
	EventEmitter.call(this)
	Logger.log("Requester::constructor port: ", port)
	this.port = port
	this.conn = null
	var send_callback;
	var socket
	var fd
	var writeInprogress = false
	var requestOutstanding = false

	//
	// Connect to the server
	//
	this.connect = function()
	{
		console.log("Connection::connect " + this.port)
		socket = net.createConnection(this.port)
		
		socket.on("error", (err)=>{
			console.log("XXXX socket error",err);
			this.emit('error', err);
		})
		socket.on("connect", ()=>{
			fd = socket._handle.fd
			Logger.log("Requester socket connected fd: ", fd);
			this.conn = new Connection(socket)
			this.conn.on('close', function(){
			})
			this.conn.on('error', function(a,b){
				console.log("Requester::conn.on error")
			})
			this.conn.on('data', onData)
			Logger.log("Requester::onconnect")
			this.emit('connect')
		})
	}

	//
	// Send a request to connected serverand calls cb when the response is available
	//
	// text - is a string (UTF8 assumed) that will go in the message body
	//
	// throws an error if:
	//		another write is in progress
	//		another request in outstanding
	//
	this.send = function(text, cb)
	{
		if( writeInprogress )
			throw new Error("cannot have two writes going at the same time")
		if( requestOutstanding )
			throw new Error("cannot have two requests going at the same time")

		Logger.log("Requester::send text:", text)
		var msg = BLKMessage.createMessage(text)
		send_callback = cb;
		requestOutstanding = true;
		writeInprogress = true;
		var result = this.conn.write(msg.toString(), ()=>{
			writeInprogress = false;
			Logger.log("Requester::send::write callback");
		})
		return result
	}
	
	this.end = () => 
	{
		Logger.log("Requester::close", this)
		if( this.conn != null && this.conn != undefined )
			this.conn.end()
	}
	//
	// Called when a complete BLK message has been received from server
	// but only gets the message body text passed to it
	//
	// throw Error is request is not outstanding ()
	//
	var onData = (msg_body_text) => {
		if( ! requestOutstanding )
			throw new Error("should not receive message until a request is sent")

		Logger.log("Requester::on_data", msg_body_text)
		
		requestOutstanding = false

		this.emit('data', msg_body_text)
		send_callback(msg_body_text)
	}

}
util.inherits(Requester, EventEmitter)

module.exports = exports = Requester

