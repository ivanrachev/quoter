(function () {
'use strict'
var quoterApp = require('./index');

var assert = quoterApp.assert;
var MongoClient = quoterApp.mongodb.MongoClient;
var Configuration = new quoterApp.Configuration();

/** 
 * @constant
 * @name SUCCESS
 * @type {null}
 * @description Used by {@link Database~callback} to signify success
 * @default null
*/
var SUCCESS = null;
/** 
 * @constant
 * @name ERROR
 * @type {null}
 * @description Used by {@link Database~callback} to signify ERROR
 * @default null
*/
var ERROR = 'database error';

/**
 * @class
 * @name Database
 * @classdesc Database represends a single point of entry for all operations on a database.
 */
var Database = function()
{
};

/**
 * connect to Mongo DB
 * @param {Database~callback} callbackConnected - The callback that handles the response.
 */
Database.prototype.connectToDatabase = function(callbackConnected)
{
	var dbConnectionUrl = Configuration.app.mongodb.connectionUrl;
	MongoClient.connect(dbConnectionUrl, function(err, db) 
	{
		if (err)
			console.log(err);
		else
		{
			console.log("Connected to mongo db server @ \n\r"
						+ dbConnectionUrl);
			Database.prototype.myDB = db;
		}
		
		callbackConnected(err);
	});
}

/**
 * insert a quote into Mongo DB
 * @param {string} quote
 * @param {Database~callback} callbackInserted - The callback that handles the response.
 */
Database.prototype.insertQuote = function(quote, callbackInserted) 
{
	var collectionName = Configuration.app.mongodb.collection;
	var collection = Database.prototype.myDB.collection( collectionName );

	/**
	 * @todo move document out into quote_retriever_job.js and 
	 * @todo create a class for it
	 */
	var document = {"from": "HKD", 
					"to": "USD", 
					"created_at": new Date(), 
					"rate": quote };

	/**
	 * @todo in case of disconnect while inserting, attempt to re-connect
	 * @todo create a class for it
	 */
	
	collection.insert( [document], 
		function (quote, callbackInserted) { return function(err, result) 
	{
		// we should have had only one operation,
		// to insert only one document without any errors
		if (err || 1 != result.result.n || 1 != result.ops.length )
		{
			callbackInserted(ERROR);
			return;
		}
		
		console.log("Inserted one quote into " + collectionName 
		            + " collection. Quote : " + quote);
		callbackInserted(SUCCESS);
		
	}; }(quote, callbackInserted) );
}

/**
 * @callback Database~callback
 * @param {string} err
 */

module.exports = Database;

})();