var chalk = require('chalk')

var L = {
	ERROR 	: 1,
	WARN  	: 2,
	DEBUG 	: 3,
	VERBOSE : 4,
	create	: function(level){
		var setLevel = level;
		return function(lev, arg){
			if( lev <= setLevel )
				console.log(arg) 
		}
		
	}
}

function Logger()
{
	this.error = function(args)
	{
		console.log(chalk.red("======================================="))
		console.log( chalk.red("ERROR"), args)
		console.log(chalk.red("======================================="))
	}
	this.log = function(args)
	{
// 		if( this.enabled )
// 			console.log(args)
	}
	
	this.setEnabled = function()
	{
		this.enabled = true
	}
	this.setDisable = function()
	{
		this.enabled = false
	}
}

var logger = new Logger();
logger.setEnabled();

module.exports = exports = logger