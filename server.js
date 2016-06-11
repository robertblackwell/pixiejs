var net = require('net')
var EventEmitter = require('events');
var util = require('util')
var process = require('process')

var Connection 	= require('./lib/connection')
var BLKServer 	= require("./lib/BlkServer")
var BLKMessage	= require("./lib/BLKMessage")
var BLK = require('./lib/blk')

var server = net.createServer();


var handler = function(msg, conn){
	var responseText = "got this message : " + msg
	// console.log("Handler  recieved ", msg.substr(1,30))
	// console.log("Handler responded ", responseText.substr(1,30))
	var response = BLKMessage.createMessage(responseText)
	// global.gc()
	// var xx = "heap used : " + process.memoryUsage().heapUsed
	// console.log(xx)
	// xx = null
	process.nextTick(conn.write, response)
}

console.log("Server starting on " + 8001)
var server = BLK.createServer(handler).listen(8001)
