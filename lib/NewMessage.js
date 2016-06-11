var util 			= require('util')
var EventEmitter 	= require('events')
var Logger 			= require("./Logger")


function Message(port, verb,  body)
{
	// console.log("new Message firstLine: " + firstLine + " port : " + port + " verb: " + verb
	// + " length: " + length + "body: " + body);
	this.firstLine = "START";
	this.destinationPort = "" + port
	this.verb = verb
	this.length = ""+body.length;
	this.body = body;
	
	this.setBody = function(newBody){
		this.body = newBody;
		this.length = ""+newBody.length
	}
	
	this.toString = function()
	{
		var s = 
		this.firstLine + "\n" 
		+ this.destinationPort + "\n" 
		+ this.verb + "\n" 
		+ this.length + "\n" 
		+ this.body; 
		return s;
	}
	
}

function CreateMessage(port, verb, body)
{
	//console.log("CreateMessage " + port + " " + verb + " " + body)
	return new Message(port, verb, body )
}

//
// Parsers a stream of characters into a stream of messages
//
function MessageParser()
{
	var _self = this
	EventEmitter.call(this)
	var currentbuffer = ""
	var lines = [];
	var body = "";
	var msgLength = 0;
	var destinationPort = -1;
	var verb = "";
	var currentBodyLength = 0;
	var currentLine = "";
	var lineCount = 0;

	function resetForNextMessage()
	{
		currentbuffer = "";
		lines = [];
		body = "";
		msgLength = 0;
		destinationPort = -1;
		verb = "";
		currentLine = ""
		currentBodyLength = 0;
		lineCount = 0
	}
	function nextLine(){
		lines.push(currentLine)
		currentLine = "";
		lineCount++				
	}

	function finishedParsing()
	{
		var m = new Message(
			destinationPort,
			verb,
			body
		)
// 		console.log("Parser::finishedParsing ", util.inspect(m))
		_self.emit('msg', m)
		resetForNextMessage()
	}

	function error(text)
	{
		console.log("NewMessage error " + text)
		_self.emit('error', text)
	}
	
	function parseCharacter(ch)
	{
		currentbuffer += ch;
		//
		// START
		//
		if( lineCount == 0 ){
			if( ch == "\n"  ){
				if (currentLine.toLowerCase() != "START".toLowerCase() ){
					error("first line must be text 'start'")
				}
				// console.log("nextLine " + currentLine);
				nextLine()
			} else {
				currentLine += ch;
				var len = currentLine.length
				if( currentLine.toLowerCase() != "START".toLowerCase().substring(0, len )) 
					error("invalid start to message ["+ currentLine +"]")
			}
		} 
		//
		// destinationPort number
		//	
		else if( lineCount == 1 ){
			if( ch == "\n" ){
				if( isNaN(parseInt(currentLine, 10)) ){
					error("second line must be numeric - destination port ["+ currentLine  +"]")
				} else if(lineCount == 1){
					destinationPort = parseInt(currentLine)
				}
// 				console.log("PARSE destinationPort " + currentLine);
				nextLine()
			}else{
				currentLine += ch;
			}
		}
		//
		// verb
		//
		else if( lineCount == 2 ){
			if( ch == "\n"  ){
				if (currentLine.toLowerCase() != "NORMAL".toLowerCase() && currentLine.toLowerCase() != "TUNNEL".toLowerCase() ){
					error("verb line must be text either  'NORMAL' or 'TUNNEL'")
				}
				verb = currentLine;
// 				console.log("PARSE verb " + currentLine);
				nextLine()
			} else {
				currentLine += ch;
				var len = currentLine.length
				if( 
					currentLine.toLowerCase() != "NORMAL".toLowerCase().substring(0, len )
					&&
					currentLine.toLowerCase() != "TUNNEL".toLowerCase().substring(0, len )
				) 
					error("invalid VERB in message ["+ currentLine +"]")
			}
		}
		//
		// message length
		// 
		else if( lineCount == 3 ){
// 			console.log("Parser body lineCount: " + lineCount + " currentLine: " + currentLine);
			if( ch == "\n" ){
				if( isNaN(parseInt(currentLine, 10)) ){
					error("message length line must be numeric - message body length")
				} else if(lineCount == 3){
					msgLength = parseInt(currentLine)
				}
// 				console.log("PARSE length " + currentLine + " messageLength"+ msgLength);
				nextLine()
			}else{
				currentLine += ch;
			}
		}else{
			
			if( body.length >= msgLength ){
				// console.log("Parser body: " + body + " body.length: " + body.length + " msgLength : " + msgLength);
				error("message body too long")
			}
			body += ch;
			if( body.length == msgLength ){
// 				console.log("PARSE body " + body)
				finishedParsing()
			}
		}

	}

	this.parse = function(buffer){
		var s = buffer.toString('utf8')
// 		console.log("Parser.parse : " + s);
		for(var i = 0; i < s.length; i++){
			parseCharacter(s.charAt(i))
		}
	}
}



util.inherits(MessageParser, EventEmitter)

module.exports = exports = {
	createMessage : CreateMessage,
	Parser : MessageParser
}