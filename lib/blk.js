
var net = require('net')
var BLKMessage = require("./BLKMessage")
var BLKServer = require("./BLKServer")
var Connection = require("./Connection")

function createServer(handler){
	var server = new BLKServer(handler)
	return server;
}

function createConnection(port){
	var socket = createConnection(port)
	var conn = new Connection(socket)
	return conn
}

function createRequester(port)
{

}

module.exports = exports = {
	createServer : createServer,
	createConnection : createConnection,
	createRequester : createRequester
}
