"use strict";
var EventEmitter = require('events')
var process 	= require('process')
var net 		= require('net')
var util 		= require('util')
var net 		= require('net')

var Connection 	= require("./Connection")
var BLKMessage 	= require("./BLKMessage")
var Requester 	= require("./Requester")
var Logger 		= require("./Logger")
Logger.setDisable()

//
// This class performs an action_ count_-times,
// after calling setup_.
// After all actions calls complete_
//
// setup_, action_ have signatures
//
//		function ( cb(err)) -- 
//
// , complete_ has signature function(err)
//
function Repeater(setup_, action_, count_, complete_)
{
	EventEmitter.call(this)
	Logger.log("Repeater::construct ")
	var setup = setup_
	var action = action_
	var count = count_
	var complete = complete_
	var counter = 0;

	this.start = function()
	{
		Logger.log("Repeater::start ")
		setup(setupComplete)

	}
	var setupComplete = (err) => 
	{
		if( err !== 0 ){
			console.log("Repeater::setupComplete err ", err )
			complete(err)
			return
		}
		counter = 0;
		process.nextTick(action, actionComplete)
	}
	var actionComplete = (err)=>
	{
		if( err !== 0 ){
			console.log("Repeater::actionComplete err ", err )
			complete(err)
			return
		}
		counter++;
		if( counter < count )	
			process.nextTick(action, actionComplete)
		else
			complete(0)
	}
}

util.inherits(Repeater, EventEmitter)

module.exports = exports = Repeater

