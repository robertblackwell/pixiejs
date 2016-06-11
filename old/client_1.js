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

var req = new Requester(8001, 34)

var onConnect = () => {
	console.log("client:connected")
	req.send("This is the message from client", ()=>{
		console.log("client::got something back from send")
	})
}

var onData = (data) => {
	console.log("client::onData : ", data)
	process.exit()
}

req.on('connect', onConnect)
req.on('data', onData)

req.connect()
