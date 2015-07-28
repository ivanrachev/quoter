#!/usr/bin/env node

'use strict'
var quoterApp = require('./lib/index');

var FiveBeans = quoterApp.fivebeans;
var assert = quoterApp.assert;
var Database = quoterApp.Database;
var argv = quoterApp.argv;
var JobDispatcher = quoterApp.JobDispatcher;
var Configuration = new quoterApp.Configuration();

/**
 * Worker connects to the database, and to beanstalkd and 
 * listens for new jobs. If a job becomes available, Worker 
 * passes it off to {@link QuoteRetrieverHandler} for 
 * execution. Worker can execute many jobs at the same time.
 * @global
 * @name Worker
 */

var db = new Database();

db.connectToDatabase(function (err)
{
	if (err)
	{
		console.log('Now closing down.');
		return;
	}
	
	var jobDispatcher = new JobDispatcher();
	jobDispatcher.connectToBeanstalkd(function() 
	{
		var runner = new FiveBeans.runner(argv.id, argv.config);
		runner.go();
		console.log('listening for new jobs');
	});
});
