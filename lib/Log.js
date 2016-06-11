var chalk = require('chalk')

var L = {
	ERROR 	: 1,
	WARN  	: 2,
	DEBUG 	: 3,
	VERBOSE : 4,
	setLevel : 0,
	module : "",
	create	: function(module, level){
		var setLevel = level
		this.setLevel = level
		this.module = module
		return function(lev, arg){
			if( lev <= setLevel )
				console.log(module +" | "+ arg) 
		}
		
	},
	log : function(level, arg) { 
		if( lev <= setLevel )
			console.log(module +" | "+ arg) 
	},
	Error 	: function(arg){ this.log(this.ERROR, arg)  } ,
	Warn 	: function(arg){ this.log(this.WARN, arg)  } ,
	Debug 	: function(arg){ this.log(this.DEBUG, arg)  } ,
	Verbose : function(arg){ this.log(this.VERBOSE, arg)  }, 
}


module.exports = exports = L