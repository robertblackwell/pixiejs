var util = require('util')
var Repeater = require('./lib/repeater')

var x;
function setup(cb){
	x = 10;
	console.log("setup")
	cb(0)
}
function action(cb){
	x = x + 10;
	console.log("action ", x)
	cb(0)
}

function complete(err){
	console.log("complete err:", err, " x: ", x)
}

var r = new Repeater(setup, action, 4, complete)
r.start();