"use strict";
var EventEmitter = require('events')
var process 	= require('process')
var net 		= require('net')
var util 		= require('util')
var net 		= require('net')

var Statistics  = require('./Stats')
var Connection 	= require("./Connection")
var BLKMessage 	= require("./BLKMessage")
var Requester 	= require("./Requester")

//
//  This class exercises a server by issuing a series of requests to the server,
//  waiting for the reply, checking the reply is correct and then issuing the next
//  request.
//
//  The number of requests issued is an option passed in.
//
//  The requests are send in batches, each batch opens a new connection
//  within each bach the same connection is used.
//
//	It collects statistics about each request
//
function Exerciser(id, options)
{
	EventEmitter.call(this)
 	console.log("Exerciser::construct id:", id, options)
	this.id = id
	this.number_of_requests_per_batch = options.number_of_requests_per_batch;
	this.number_of_batches = options.number_of_batches;
	this.port = options.server_port
	this.request_count = 0;
	this.batch_count = 0;

	console.log("Exerciser::constuctor::id ", id, options)

	this.getId = function()
	{
		return this.id;
	}

	function setup(cb)
	{

	}

	function action(cb)
	{

	}

	this.start = function()
	{
		console.log("Exerciser::start id:", this.id)
		sendFirstRequest()

	}
	var scheduleNextBatch = () => {
		this.batch_count++;
		this.request_count = 0;
		console.log("SchedulenextBatch id:", this.id, " batch: ", this.batch_count)
		process.nextTick(scheduleNextRequest)

	}
	var scheduleNextRequest = ()=> {
		console.log("Schedule next request id: ", this.id, "request: ", this.request_count, " batch: ", this.batch_count)
		this.requester.send(this.msg, ()=>{
			console.log("Exerciser::scheduleNextRequest::msgSent")			
		})
		// setTimeout(
		// 	() => {
		// 		console.log("Exerciser::start - request id:", this.id)
		// 		requestComplete()
		// 	}, 1000)				
	}

	var requestComplete = ( )=> {
		console.log("Exerciser::requestComplete id:", this.id)
		this.request_count++;
		if( this.request_count < this.number_of_requests_per_batch )
			process.nextTick(scheduleNextRequest)
		else{
			if( this.batch_count < this.number_of_batches ){
				process.nextTick( scheduleNextBatch)
			}else{
				this.emit('complete', this, this.stats);
			}
		}
	}

	var onMessage = (inMsg) => {
		console.log("Exerciser::sendFirstRequest::onconnect", inMsg)
	}

	var sendFirstRequest = () =>{
		console.log("Exerciser::sendFirstRequest")
		this.request_count = 0;
		this.batch_count = 1;
		this.stats = new Statistics.Statistics()
		this.requester = new Requester(this.port, this.id)
		this.requester.on('connect', ()=>{
			scheduleNextRequest()
		}) 
		this.requester.on('data', onMessage);
		this.requester.connect()
	}

}

util.inherits(Exerciser, EventEmitter)

module.exports = exports = Exerciser

