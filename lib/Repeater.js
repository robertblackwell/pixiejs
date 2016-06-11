"use strict";
var EventEmitter = require('events')
var process 	= require('process')
var net 		= require('net')
var util 		= require('util')
var net 		= require('net')

var Connection 	= require("./Connection")
var BLKMessage 	= require("./BLKMessage")
var Requester 	= require("./Requester")

var Log			= require('../lib/Log')
var moduleName = "Repeater"
var logger = Log.create(moduleName, Log.WARN)


//
// This class performs an action_ count_-times,  after calling setup_.
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
	logger(Log.DEBUG, "constructor ")
	var setup = setup_
	var action = action_
	var count = count_
	var complete = complete_
	var counter = 0;

	this.start = function()
	{
		logger(Log.DEBUG, "start ")
		setup(setupComplete)

	}
	var setupComplete = (err) => 
	{
		if( err !== 0 ){
			logger(Log.DEBUG, "setupComplete err ", err )
			complete(err)
			return
		}
		counter = 0;
		process.nextTick(action, actionComplete)
	}
	var actionComplete = (err)=>
	{
		if( err !== 0 ){
			logger(Log.DEBUG, "actionComplete err ", err )
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

