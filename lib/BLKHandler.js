var net = require('net')
var EventEmitter = require('events');
var util = require('util')
var Connection = require('./connection')
var Logger = require("./Logger")
Logger.setDisable()

//
// This class provides a context object for serving a single socket
//
function BLKHandler(socket_, hfunc_)
{
	var socket = socket_
	var handlerFunction = hfunc_
	var fd = socket._handle.fd
	var counter = 0

	conn = new Connection(socket)

	conn.on('close', (connection) =>{
		console.log('server got close nbr: ', counter)
		this.emit('close', this)
	})

	conn.on('error', function(err){
		Logger.log('server got connection error ')	

	})

	conn.on('data', function(msg, conn){
		console.log("server::ondata ", conn.socket._handle.fd)
		console.log("server::ondata fd: ", fd, " msg: ", msg, " conn.fd ", conn.socket._handle.fd)
		handlerFunction(msg, conn)
		counter++
	})

	this.start = function(){
		conn.start()
	}
	this.cleanup = function(){
		socket = null
		fd = null
		handlerFunction = null
	}

}

util.inherits(BLKHandler, EventEmitter)

module.exports = exports = BLKHandler
