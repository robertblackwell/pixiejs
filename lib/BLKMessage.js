/**
** This module implements the format for BLKMessage
**/
var util = require('util')
var EventEmitter = require('events')
var Logger = require("./Logger")
Logger.setDisable()


function Message(firstLine, length, body)
{
	this.firstLine = "START";
	this.length = ""+length;
	this.body = body;
	this.toString = function()
	{
		return this.firstLine + "\n" + this.length + "\n" + body;
	}
}

function CreateMessage(text)
{
	return new Message("START", text.length, text )
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
	var currentBodyLength = 0;
	var currentLine = "";
	var lineCount = 0;

	function resetForNextMessage()
	{
		currentbuffer = "";
		lines = [];
		body = "";
		msgLength = "";
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
		Logger.log("Parser::finishedParsing body", body)
		var msg = {
			startLine : lines[0],
			length : msgLength,
			body : body
		}
		_self.emit('msg', msg)
		resetForNextMessage()
	}

	function error(text)
	{
		_self.emit('error', text)
	}
	
	function parseCharacter(ch)
	{
		currentbuffer += ch;
		if( lineCount == 0 ){
			if( ch == "\n"  ){
				if (currentLine.toLowerCase() != "START".toLowerCase() ){
					error("first line must be text 'start'")
				}
				nextLine()
			} else {
				currentLine += ch;
				var len = currentLine.length
				if( currentLine.toLowerCase() != "START".toLowerCase().substring(0, len )) 
					error("invalid start to message ["+ currentLine +"]")
			}
		} else if( lineCount == 1 ){
			if( ch == "\n" ){
				if( isNaN(parseInt(currentLine, 10)) ){
					error("second line must be numeric - message body length")
				} else if(lineCount == 1){
					msgLength = parseInt(currentLine)
				}
				nextLine()
			}else{
				currentLine += ch;
			}
		}else{
			if( body.length >= msgLength ){
				error("message body too long")
			}
			body += ch;
			if( body.length == msgLength ){
				finishedParsing()
			}
		}

	}

	this.parse = function(buffer){
		var s = buffer.toString('utf8')
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