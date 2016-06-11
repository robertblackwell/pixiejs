var process = require('process')

var Statistics = require("./lib/Stats")

var stats1 = new Statistics.Statistics()
var stats2 = new Statistics.Statistics()
var handler = new Statistics.StatsHandler()
// var et = new Statistics.ElapsedTime()

// console.log(et)
// setTimeout(function(){
// 	var e = et.elapsed()
// 	console.log(e)
// }, 500)
// return
var done_count = 0
function done(stat){
	console.log("done ", done_count)
	handler.accumulate(stat)
	done_count++
	if( done_count == 2){
		handler.print()
		process.exit();
	}
}

var count = 0;
stats1.startRequest(1000)
console.log(stats1)
var t = setInterval(function(){
	stats1.endRequest(400)
	stats1.startRequest(1000)
	console.log(stats1)
	count++
	if (count == 6 ){
		clearInterval(t)
		done(stats1)
	}
}, 500)

var count2 = 0;
stats2.startRequest(1000)
console.log(stats2)
var t2 = setInterval(function(){
	stats2.endRequest(400)
	stats2.startRequest(1000)
	console.log(stats2)
	count2++
	if (count2 == 6 ){
		clearInterval(t2)
		done(stats2)
	}
}, 486)

