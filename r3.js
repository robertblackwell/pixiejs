var util = require('util')
var process = require('process')
var domain = require('domain').create()
var Batches = require('./lib/Batch')
var Repeater = require('./lib/repeater')
var Requester = require("./lib/Requester")
var Logger = require("./lib/Logger")
Logger.setDisable()


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

var big_messages = true

if(big_messages){
	for(var i = 0; i < msgs.length; i++){
		messages.push( bulk( msgs[i] ) )
	}
	msgs = null
}else{
	messages = msgs;
}

	var mb = new Batches({
		nbr_batches : 40,
		nbr_per_batch : 100,
		messages	: messages,
		callback : function(statsHandler){
			statsHandler.print()
			console.log("WE are all done")
		}
	})
return


domain.on('error', function(){
	console.log("domain error")
	console.trace('domain error');
});
domain.run(function(){
	var mb = new Batches({
		nbr_batches : 3,
		nbr_per_batch : 1000,
		messages	: messages,
		callback : function(statsHandler){
			statsHandler.print()
			console.log("WE are all done")
		}
	})
});
