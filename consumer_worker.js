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
 * consumer_worker connects to the database, and to beanstalkd and 
 * listens for new jobs. If a job becomes available, consumer_worker 
 * passes it off to {@link QuoteRetrieverHandler} for 
 * execution. consumer_worker can execute many jobs at the same time.
 * @global
 * @name consumer_worker
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
