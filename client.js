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
return;

var options = {
		number_of_exercisers : 2,
		exerciser : Exerciser,
		exerciser_options : {
			server_port : 8001,
			number_of_batches : 3,
			number_of_requests_per_batch : 4
	}
}
var driver = new Driver(options)
driver.run();

driver.on('complete', (stats) => {
	console.log("Client : driver complete")
	stats.print()
})

// var net = require('net')
// var createMessage = require("./lib/BLKMessage").createMessage

// const NUMBER_OF_THREADS = 2
// const NUMBER_OF_ITERATIONS = 1

// var options = {}
// var instances = [];
// var i
// for(i = 0; i < NUMBER_OF_THREADS; i++){
// 	var instance = new Exerciser(options)
// 	instances.push(instance);
// 	instance.on('complete', function(instance, stats){
// 		console.log("instance ", i, " complete")
// 		Stats.accumulate(stats)
// 		var ix = instances.indexOf(instance)
// 		instances.splice(ix,1)
// 		if( instances.length == 0 )

// 	}) 
// }



// var port = 8001
// var conn = net.createConnection(port)

// conn.on('connect', function(){
// 	console.log('client is connected : ', conn.remotePort )

// 	var msg = createMessage("this is a test message")
// 	console.log("the message is : ", msg)
// 	conn.write(msg.toString())
// 	conn.write('quit')
// 	conn.end()

// })