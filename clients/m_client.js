//
// This is a client process that is intended to exercise a server
// by issuing a series of (async) requests and checking the result.
//
// It is both a load and parallel operation test.
//
//
"use strict";
var process = require('process')

var Driver 		= require('./lib/Driver')
var Exerciser 	= require("./lib/Exerciser")
var Requester 	= require("./lib/Requester")
var BLKMessage 	= require("./lib/BLKMessage")
var BLK 		= require('./lib/blk')
var Logger		= require('./lib/Logger')
var util		= require('util')
var NewMessage	= require('./lib/NewMessage')

//
// send this message to server and call cb when done
//
function Client( _id_str, msg, cb)
{
	this.id_str = _id_str;
	this.port = msg.destinationPort;
// 	console.log(util.inspect(msg))
// 	console.log("PORT: " + msg.destinatiionPort)

	var req = new Requester(this.port)
	
	var onConnect = () => {
		Logger.log("client "+ this.id_str +" :connected")
		msg.setBody( "From client : "+this.id_str +":"+ msg.body)
		
		req.sendMessage(msg, ()=>{
			console.log("client " + this.id_str + "::got something back from send")
		})
	}
	
	var onData = (data) => {
		console.log("client "+ this.id_str +" ::onData : " + data)
		cb(this)
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
function MultiClientRunner(numberOfClients, msg)
{
	this.client_count = numberOfClients;
	this.clients_remaining = numberOfClients;
	this.clients = [];
	var client_done = (client) =>{
		console.log(["client_done ", client.id_str, "remaining: ", this.clients_remaining])
		this.clients_remaining--
		if(this.clients_remaining == 0){
			process.exit()
		}
	}
	
	for(var i = 0; i < this.client_count; i++){
		console.log("MultiClientRunner - create client : " + i )
		var dup_msg = NewMessage.createMessage(msg.destinationPort, msg.verb, msg.body)
		console.log(util.inspect(msg))
		console.log(util.inspect(dup_msg))
		var client = new Client("Client[ " +i + " ]", dup_msg, client_done )
		console.log(util.inspect(client))
		this.clients.push(client)
	}
	this.start = function(){
		for(var i = 0; i < this.client_count; i++){
		console.log("MultiClientRunner - STARTING client : " + i )
			this.clients[i].start();
		}
	}
}
var testMessages = [
	NewMessage.createMessage(8001, "NORMAL", "This is a message from client 111"),
	NewMessage.createMessage(8001, "NORMAL", "This is a message from client 222")
];

var test = new MultiClientRunner(1, testMessages[0]);
test.start();

