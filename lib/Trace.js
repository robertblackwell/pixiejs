var chalk = require('chalk')

var levels = {
	ERROR 	: 1,
	WARN  	: 2,
	DEBUG 	: 3,
	VERBOSE : 4,
}

function TraceClass(module, level)
{
	this.setLevel  = level
	this.module  = module

	this.log = function(level, arg) { 
		if( level <= this.setLevel )
			console.log(module +" | "+ arg) 
	}
	this.Error 	= function(arg){ 
		this.log(levels.ERROR, arg)  
	} 
	this.Warn 	= function(arg){ 
		this.log(levels.WARN, arg)  
	} 
	this.Debug 	= function(arg){ 
		this.log(levels.DEBUG, arg)  
	} 
	this.Verbose = function(arg){ 
		this.log(levels.VERBOSE, arg)  
	} 
}


module.exports = exports = TraceClass