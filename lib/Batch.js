var util = require('util')
var process = require('process')

var Statistics = require("./Stats")
var Repeater = require('./Repeater')
var Requester = require("./Requester")
var Logger = require("./Logger")
Logger.setDisable()


function RequestBatch(msgArray_ , number_of_repeats_ )
{
	var msgArray = msgArray_
	var m = msgArray.length
	var req
	var completionCallback;
	var action_cb;
	var count = 0;
	var kount = 0;
	var number_of_repeats = number_of_repeats_
	var repeater
	var stats = new Statistics.Statistics()

	this.connect = (cb) => {
		Logger.log("RequestBatch::connect ")
		req = new Requester(8001)
		var onConnect = () => {
			Logger.log("client:connected ")
			cb(0)
		}
		req.on('connect', onConnect)
		req.on('data', this.onData)
		req.on("error", this.onError);
		req.connect()

	}
	this.onError = (err) => {
			console.log("RequestBatch on error - terminate batch");
			// stats.error();
			complete(err)
	}
	
	this.onData = (data) => {
		Logger.log("RequestBatch::onData ")
		stats.endRequest(data.length)
		action_cb(0)
	}

	this.sendRequest = (cb)=> {
		Logger.log("RequestBatch::sendRequest ")
		action_cb = cb
		var msg = msgArray[ count];
		kount ++;
		count = (count + 1) % m

		stats.startRequest(msg.length)
		
		req.send( kount + msg + kount, ()=>{
			// console.log("client::got something back from send")
		})		
		Logger.log("action")
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
			console.log("Batch::complete err: ", err)
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
	var batch_count = options.nbr_batches
	var per_batch_count = options.nbr_per_batch
	var messageArray = options.messages
	var callback = options.callback
	var statsHandler = new Statistics.StatsHandler()

	var batches = [];
	var onDone = (batch, stats)=>{
		console.log("batch complete")

		statsHandler.accumulate(stats)
		
		var ix = batches.indexOf(batch)
		batches.splice(ix,1)

		if( batches.length == 0){
			callback(statsHandler)
		}
	}

	for(var i = 0; i < batch_count ; i++ ){
		var b = new RequestBatch(messageArray, per_batch_count)
		batches.push(b)
		b.start(onDone)
	}


}


module.exports = exports = MultipleBatches