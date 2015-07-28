#!/usr/bin/env node
'use strict'
var quoterApp = require('./lib/index');

var fivebeans = quoterApp.fivebeans;
var JobMissile = quoterApp.JobMissile;
var Configuration = new quoterApp.Configuration();

/**
 * Seeder puts one job to the queue and exits.
 * @global
 * @name Seeder 
 */


var close_down_and_exit = function()
{
	console.log('Now closing down.');
	emitter.end();
	process.exit(0);
};

var hostName = Configuration.app.beanstalkd.host;
var port = Configuration.app.beanstalkd.port;
var tubeName = Configuration.app.tubeName;
var priority = Configuration.app.job.priority;
var timeToRun = Configuration.app.job.timeToRun;

var emitter = new fivebeans.client(hostName, port);
emitter.on('connect', function()
{
	emitter.use(tubeName, function(err, tname)
	{
		console.log("using " + tname);
		
		var job = new JobMissile();
		var payload = JSON.stringify([tubeName, job]);
		console.log('job to queue: ' + payload);
		emitter.put(priority, 0, timeToRun, payload, function(err, jobid)
		{
			console.log('queued a Quote job into tube:'+ tubeName + ' jobid: ' + jobid);
			emitter.stats_tube(tubeName, function(err, response) {
				console.log(JSON.stringify(response));
				close_down_and_exit();
			});
		});
	});
});

emitter.connect();
