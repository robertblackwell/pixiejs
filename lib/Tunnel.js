"use strict";
var EventEmitter = require('events')
var process 	= require('process')
var net 		= require('net')
var util 		= require('util')
var BLKMessage 	= require("./BLKMessage")
var Parser 		= BLKMessage.Parser

var Log			= require('../lib/Log')
var moduleName = "Tunnel"
var logger = Log.create(moduleName, Log.DEBUG)


//
// This class implements a Tunneling protocol
// a bit similar to how HTTPS works with a proxysending a BLKMessage request to a server
// and waiting for the response
//
//		on('error', f(err)) -	error object err, thereafter connection is closed

function Tunnel(port)
{
	EventEmitter.call(this)
	logger(Log.DEBUG, "constructor port: ", port)
	this.port = port
	this.socket = null;
	var socket
	var parser = new Parser();
	var tunnelRequestPending = false
	var connected = false;
	
	//-------------------------------------------------------------
	// set up to parser the response to the "tunnel request"
	//-------------------------------------------------------------
	parser.on('msg', (msg)=>{
		if( tunnelRequestPending ){
			if( msg.verb != "TUNNEL" ){
				this.emit('error')			
			}else{ 
				tunnelRequestPending = false;
				this.emit('connect')
			}
		}else{
			this.emit('data', msg);
		}		
	})

	parser.on('error', (err)=>{
		this.emit('error', err);
	})
	
	var assembleMessage = (data)=>{
		logger(Log.DEBUG, " assembleData : " + data )
		parser.parse(data.toString('utf8'))
	}
	//-------------------------------------------------------------
	// function to start connection - told by event when connection
	// is established
	//-------------------------------------------------------------
	this.connect = function()
	{
		logger(Log.DEBUG, " socket exists : " + (socket == null) )
		socket = this.socket = net.connect({port: this.port}, ()=>{
			tunnelRequestPending = true
			connected = true
			
			socket.on('data', assembleMessage);
			
			var tunnelRequestMessage = BLKMessage.createMessage(port, "TUNNEL", "11")
			logger(Log.DEBUG, " tunnel request : " + util.inspect(tunnelRequestMessage) )
			
			var result = socket.write(tunnelRequestMessage.toString(), ()=>{
				logger(Log.DEBUG, " write CB " + result )
			})			
		})
	}	
	//-------------------------------------------------------------
	// function to write a BLKMessage 
	//-------------------------------------------------------------
	this.write = function(msg, cb)
	{
		logger(Log.DEBUG, "write : " + util.inspect(msg) )
		socket.write(msg.toString(), cb)
	}

}
util.inherits(Tunnel, EventEmitter)

module.exports = exports = Tunnel

