//
// Starts a number of instances of an exerciser class
// collects statistic on the completion of the exerciser
// and prints stats when all exercisers have finished
//
"use strict";

var Exerciser = require("./Exerciser")
var Statistics = require('./Stats')
var EventEmitter = require('events')
var util = require('util')

function Driver(options)
{
	EventEmitter.call(this)
	var self = this;
	this.options = options
	this.number_of_exercisers = options.number_of_exercisers;
	this.exerciser = options.exerciser;
	this.instances = [];
	this.statsHandler = new Statistics.StatsHandler()

	this.startExercisers = function()
	{
		var i
		for(i = 0; i < this.number_of_exercisers; i++)
		{
			var instance = new this.exerciser(i, options.exerciser_options)
			this.instances.push(instance);

			instance.on('complete', (inst, stats) =>
			{
				var ix = this.instances.indexOf(inst)
				console.log("instance ", inst.getId(), " complete")
				console.log("instance ", stats, " complete")
				console.log("instance ", this.statsHandler, " complete")

				this.statsHandler.accumulate(stats)
				
				this.instances.splice(ix,1)
				if( this.instances.length == 0 ){
					// this.statsHandler.print();
					this.emit('complete', this.statsHandler)
				}
			}) 
			instance.start();
		}
	}
	this.run = function _run()
	{
		// console.log(util.inspect(self))
		this.startExercisers()
	}

}


util.inherits(Driver, EventEmitter);

module.exports = exports = Driver