var net 			= require('net')
var EventEmitter 	= require('events');
var util 			= require('util')
var process 		= require('process')

var BLK = require('./lib/blk')


var handler = function(msg, conn, cb){
// 	console.log("Handler  received ", util.inspect(msg))

	msg.setBody("Handler function Got this  : [" + msg.body + "]")
	process.nextTick(()=>{
// 		console.log("NextTick CB")
		conn.write(msg, cb)
	})
}

console.log("Server starting on " + 8001)
var server = BLK.createServer(handler).listen(8001)
