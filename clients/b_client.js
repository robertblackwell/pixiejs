#!/usr/bin/env node
var util 		= require('util')
var process 	= require('process')
var domain 		= require('domain').create()
var Batches 	= require('../lib/Batch')
var Repeater 	= require('../lib/repeater')
var Requester 	= require("../lib/Requester")

var Log			= require('../lib/Log')
var moduleName = "b_client"
var logger = Log.create(moduleName, Log.DEBUG)

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

var msgs = [
	"1111111 oneoneoneoneoneoneoneone 1111111",
	"2222222 twotwotwotwotwotwotwotwotwotwo 222222",
	"3333333333 threethreethreethreethreethreethree 333333",
	"444444 fourfourfourfourfourfourfour 44444",
	"555555555 fivefivefivefivefivefivefivefivefivefivefivefivefivefive 5555"
];

var messages = [];

function bulk(str, count){
	var s = "";
	for(;;){
		s += str
		if( s.length > 100000)
			break
	}
	return s;
}

var big_messages = false

if(big_messages){
	for(var i = 0; i < msgs.length; i++){
		messages.push( bulk( msgs[i] ) )
	}
	msgs = null
}else{
	messages = msgs;
}

var mb = new Batches({
	nbr_batches : 50,
	nbr_per_batch : 100,
	port : _port,
	messages	: messages,
	callback : function(statsHandler){
		statsHandler.print()
		console.log("WE are all done")
	}
})
