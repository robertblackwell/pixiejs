var util = require('util')
var Repeater = require('./lib/repeater')
var Requester = require("./lib/Requester")

function Action(id_)
{
	var id = id_
	var completionCallback;
	var x;
	var r = new Repeater(setup, action, 4, complete)
	function setup(cb){
		x = 10;
		console.log("setup id: ", id)
		cb(0)
	}
	function action(cb){
		x = x + 10;
		console.log("action id: ", id,  x)
		cb(0)
	}
	function complete()
	{
		completionCallback()
	}
	this.start = function(cb)
	{
		completionCallback = cb
		r.start()
	}
}

var a = new Action("111111111111");
a.start(function(){
	console.log("Done")
})
var a2 = new Action("222222222222");
a2.start(function(){
	console.log("Done")
})