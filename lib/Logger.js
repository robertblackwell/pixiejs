var chalk = require('chalk')

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