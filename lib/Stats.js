"use strict"
var p 		= require('process')
var math 	= require('mathjs')

class ElapsedTime
{
	constructor()
	{
		var t = p.hrtime()
		this.start_secs = t[0]
		this.start_nano = t[1]
	}
	elapsed()
	{
		var t = p.hrtime()

		// Calculate the difference in the "seconds" component
		var t2 = t[0]
		var t1 = this.start_secs
		var td = t2 - t1
		// now convert to milliseconds
		var td_secs_as_ms = td * 1000

		// compute the diff in th nano_secs component
		var tn2 = t[1]
		var tn1 = this.start_nano
		// comvert to ms
		var td_nano_as_ms = (tn2-tn1)/1000000

		// combine to get elapsed time in ms
		// var elaps_ms = Math.round(td_nano_as_ms + td_secs_as_ms)
		var elaps_ms = (td_nano_as_ms + td_secs_as_ms)
		return elaps_ms;
	}
}

class Statistics
{
	constructor()
	{
		this.requests_count = 0
		this.requestCharacterCount = 0
		this.responseCharacterCount = 0
		this.total_elapsed
		this.elapsed_per_request = []
	}
	startRequest(requestCount)
	{
		this.requestCharacterCount += requestCount
		this.timer = new ElapsedTime()
	}
	endRequest(responseCount)
	{
		this.requests_count++;
		this.responseCharacterCount += responseCount
		this.elapsed_per_request.push(this.timer.elapsed()) 
	}
	add(stats)
	{
		this.requests_count += stats.requests_count
		this.requestCharacterCount += stats.requestCharacterCount
		this.responseCharacterCount += stats.responseCharacterCount
		this.elapsed_per_request = this.elapsed_per_request.concat(stats.elapsed_per_request)
	}

}

class StatsHandler
{
	constructor()
	{
		this.stats_total = new Statistics()
		console.log("StatsHandler::constructor")
	}
	accumulate(stats)
	{
// 		console.log("StatsHandler:accumulate")
		this.stats_total.add(stats)
	}
	print()
	{
		console.log("StatsHandler:print")
		console.log("request count      : ",this.stats_total.requests_count)		
		console.log("request char count : ",this.stats_total.requestCharacterCount)
		console.log("response char count: ",this.stats_total.responseCharacterCount)
		console.log("elapsed mean       : ",math.mean(this.stats_total.elapsed_per_request), " ms" )
		console.log("elapsed std        : ",math.std(this.stats_total.elapsed_per_request), " ms" )
	}
}

module.exports = exports = {
	Statistics : Statistics,
	StatsHandler : StatsHandler,
	ElapsedTime :ElapsedTime	
}