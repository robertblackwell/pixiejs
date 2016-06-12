var util 		= require('util')
var process 	= require('process')

var Statistics 	= require("./Stats")
var Repeater 	= require('./Repeater')
var Requester 	= require("./Requester")
var Message 	= require('./BLKMessage')

var Log			= require('../lib/Log')
var moduleName = "Batch"
var logger = Log.create(moduleName, Log.WARN)



function RequestBatch(options) //msgArray_ , number_of_repeats_ )
{
	var msgArray = this.messages = options.messages
	var number_of_repeats = this.number_of_repeats = options.count
	var port = this.port = options.port
	
	var m = msgArray.length
	var req
	var completionCallback;
	var action_cb;
	var count = 0;
	var kount = 0;
	var repeater
	var stats = new Statistics.Statistics()

	this.connect = (cb) => {
		logger(Log.DEBUG, "connect ")
		req = new Requester(port)
		var onConnect = () => {
			logger(Log.DEBUG, "client:connected ")
			cb(0)
		}
		req.on('connect', onConnect)
		req.on('data', this.onData)
		req.on("error", this.onError);
		req.connect()

	}
	this.onError = (err) => {
			logger(Log.ERROR, " on error - terminate batch");
			// stats.error();
			complete(err)
	}
	
	this.onData = (data) => {
		logger(Log.DEBUG, "onData ")
		stats.endRequest(data.toString().length)
		action_cb(0)
	}

	this.sendRequest = (cb)=> {
		logger(Log.DEBUG, "sendRequest ")
		action_cb = cb
		var msgBody = msgArray[ count];
		kount ++;
		count = (count + 1) % m

		var port = 8001
		var verb = "NORMAL"
		var msg = Message.createMessage(port, verb, msgBody)
		msg.setBody( "["+ kount +"]" + msg.body)
		logger(Log.DEBUG, util.inspect(msg));

		stats.startRequest(msg.toString().length)
		
		req.sendMessage( msg, ()=>{
			logger(Log.DEBUG, "client::got something back from send")
		})		
		logger(Log.DEBUG, "action")
	}


	this.start = (cb) =>
	{
		completionCallback = cb
		process.nextTick(repeater.start)
		return this
	}
	//
	// Gets called by repeater when finished all iterations
	//
	var complete = (err) =>
	{
		if( err != 0){
			logger(Log.DEBUG, "Batch::complete err: ", err)
		}
		req.end()
		completionCallback(this, stats)
	}
	repeater = new Repeater(this.connect, this.sendRequest, number_of_repeats, complete)
}

//
// options = {
//		nbr_batches : number of independetn batches of requests,     
//		nbr_per_batch : number of requests on same connection per batch,
//		messages : array of strings to use as body text for requests
//		callback : callback when all batches are done
//		
//	}
//
//
function MultipleBatches(options)
{
	var port = options.port
	var batch_count = options.nbr_batches
	var per_batch_count = options.nbr_per_batch
	var messageArray = options.messages
	var callback = options.callback
	var statsHandler = new Statistics.StatsHandler()

	var batches = [];
	var onDone = (batch, stats)=>{
		logger(Log.DEBUG, "batch complete")

		statsHandler.accumulate(stats)
		
		var ix = batches.indexOf(batch)
		batches.splice(ix,1)

		if( batches.length == 0){
			callback(statsHandler)
		}
	}

	for(var i = 0; i < batch_count ; i++ ){
		var b = new RequestBatch({
			messages : messageArray, 
			count : per_batch_count,
			port : port
		})
		batches.push(b)
		b.start(onDone)
	}


}


module.exports = exports = MultipleBatches