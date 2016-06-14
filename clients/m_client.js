#!/usr/bin/env node
//
//
// This is a client process that is intended to exercise a server
//
// Starts multiple clients each of which sends a single request
//
//
//
"use strict";
var process = require('process')
var util		= require('util')

var Driver 		= require('../lib/Driver')
var Exerciser 	= require("../lib/Exerciser")
var Requester 	= require("../lib/Requester")
var BLK 		= require('../lib/blk')
var Logger		= require('../lib/Logger')
var BLKMessage	= require('../lib/BLKMessage')

var Log			= require('../lib/Log')
var moduleName = "m_client"
var logger = Log.create(moduleName, Log.WARN)

//
// send this message to server and call cb when done
//
function Client(options) 
{
	this.cb = options.cb
	this.msg = options.msg
	this.id_str = options.id;
	this.port = options.port
// 	this.port = msg.destinationPort;

	logger(Log.VERBOSE, util.inspect(this.msg))
	logger(Log.VERBOSE, "PORT: " + this.msg.destinatiionPort)

	var req = new Requester(this.port)
	
	var onConnect = () => {
		logger(Log.DEBUG, "client "+ this.id_str +" :connected")
		this.msg.setBody( "From client : "+this.id_str +":"+ this.msg.body)
		logger(Log.DEBUG, util.inspect(this.msg))

		req.sendMessage(this.msg, ()=>{
			logger(Log.WARN, "client " + this.id_str + " sent something to server")
		})
	}
	
	var onData = (data) => {
		logger(Log.DEBUG, "XX client "+ this.id_str +" ::onData : " + data)
		req.end()
		this.cb(this)
	}
	req.on('connect', onConnect)
	req.on('data', onData)
	
	this.start = function(){
		req.connect();
	}
}

//
// start a number of clients all of whom will send the same message and wait
//
function MultiClientRunner(numberOfClients, _port, msg)
{
	this.port = _port
	this.client_count = numberOfClients;
	this.clients_remaining = numberOfClients;
	this.clients = [];
	var client_done = (client) =>{
		logger(Log.WARN, ["client_done ", client.id_str, "remaining: ", this.clients_remaining])
		this.clients_remaining--
		if(this.clients_remaining == 0){
			process.exit()
		}
	}
	
	for(var i = 0; i < this.client_count; i++){
		logger(Log.WARN, "MultiClientRunner - create client : " + i )

		var dup_msg = BLKMessage.createMessage(msg.destinationPort, msg.verb, msg.body)

		logger(Log.DEBUG, util.inspect(msg))
		logger(Log.DEBUG, util.inspect(dup_msg))

		var client = new Client({
			id: "Client[ " +i + " ]", 
			msg: dup_msg, 
			port : this.port,
			cb: client_done
		})
		
		logger(Log.DEBUG, util.inspect(client))
		
		this.clients.push(client)
	}
	this.start = function(){
		for(var i = 0; i < this.client_count; i++){
			logger(Log.WARN, "MultiClientRunner - STARTING client : " + i )
			this.clients[i].start();
		}
	}
}
var testMessages = [
	BLKMessage.createMessage(8002, "NORMAL", "This is a message from client 111"),
	BLKMessage.createMessage(8002, "NORMAL", "This is a message from client 222")
];

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

var test = new MultiClientRunner(100, _port, testMessages[0]);
test.start();

