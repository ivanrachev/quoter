(function () {
'use strict'
var quoterApp = require('./index');

var assert = quoterApp.assert;
var http = quoterApp.http;
var Configuration = new quoterApp.Configuration();

/** 
 * @constant
 * @name SUCCESS
 * @type {null}
 * @description Used by {@link WebCrawler~callback} to signify success
 * @default null
*/
var SUCCESS = null;
/** 
 * @constant
 * @name ERROR
 * @type {null}
 * @description Used by {@link WebCrawler~callback} to signify ERROR
 * @default null
*/
var ERROR = 'WebCrawler error';

var retrieve_new_quote = function(url, callback) 
{
	var request = http.get(url, function(url, callback){ return function(res) 
	{
		console.log("Got response for " + url + " code:" + res.statusCode);
		if (res.statusCode != 200)
		{
			callback(ERROR, null);
			return;
		}
		process_responce(res, callback);
	}; } (url, callback) );
	
	request.on('error', function(url, callback){ return function(e) 
	{
		console.log("Got error accessing " + url + " \n\r" + e.message);
		callback(ERROR, null);
	}; } (url, callback) );
};

var process_responce = function (response, callback)
{
	// closure to share responseBody between 
	// the two callbacks (onData and onEnd) for a given response
	function common (callback)
	{ 
		var responseBody = '';
		var responseBodyUID = new Date().getTime();
		
		var onData = function (chunk) 
		{
			// assemble the chunks into a web page
			responseBody += chunk;
			console.log('BODY length: ' + chunk.length 
						+ ' UID: ' + responseBodyUID);
		};
		
		var onEnd = function () 
		{ 
			console.log('responseBody length: ' + responseBody.length 
						+ ' UID: ' + responseBodyUID);
			extract_quote_from_web_page_body(responseBody, callback); 
		}; 
		
		return [onData, onEnd];
	}
	
	var c = common(callback);
	response.on('data', c[0] );
	response.on('end',  c[1] );
};

var extract_quote_from_web_page_body = function (responseBody, callback) 
{
	console.log("The whole webpage received!");

	//var quotesUrlBody = WebCrawler.prototype.quotesUrlBody;
    var quotesUrlBody = responseBody;
    // remove any new lines from the webpage that may trip the reg ex
	quotesUrlBody = quotesUrlBody.replace(/(\r\n|\n|\r)/gm,"");
	
	// find the one line with the quote
	var matchedStrings = /Hong Kong Dollar = \d*\.?\d+/.exec(quotesUrlBody);
	if (matchedStrings == null || matchedStrings.length == 0)
	{
		console.log('WebCrawler could not find the quote on webpage: '
					+ Configuration.app.feeder.url);
		callback(ERROR, null); 
		return;
	}
	
	// grab just the quote from the whole line
	var newQuote = /\d*\.?\d+/.exec(matchedStrings[0]);
	
	// round off to two decimals after .
	var newQuoteAsFloat = parseFloat(newQuote);
	newQuote = newQuoteAsFloat.toFixed(2);
	
	console.log("The new quote is " + newQuote);
	callback(SUCCESS, newQuote);
};

/**
 * @class
 * @name WebCrawler
 * @classdesc WebCrawler retrieves contents of a webpage and 
 * tries to parse out the quote from it.
 */
var WebCrawler = function()
{
};

/**
 * retrieves contents of a webpage and tries to parse out the 
 * quote from it.
 * @param {WebCrawler~callback} callback - The callback that 
 * handles the response.
 */
WebCrawler.prototype.getQuote = function(callback)
{
	/**
	 * @todo put the feederUrl into the job payload 
	 * so jobs can choose the To/From currency for a given quote.
	 */
	var feederUrl = Configuration.app.feeder.url;
	retrieve_new_quote(feederUrl, callback);
};

module.exports = WebCrawler;

/**
 * @callback WebCrawler~callback
 * @param {string} err. 
 * @param {string} newQuote
 */


})();