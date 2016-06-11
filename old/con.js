"use strict";
var process 	= require('process')
var net 		= require('net')
var util 		= require('util')


var server = net.createConnection(8001, function(){

	console.log("got a listen accept")
})

// var socket = net.connect(8001, function(a,b,c){
// 	console.log('connected')
// })
