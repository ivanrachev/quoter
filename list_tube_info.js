#!/usr/bin/env node
'use strict'
var quoterApp = require('./lib/index');

var fivebeans = quoterApp.fivebeans;
var JobMissile = quoterApp.JobMissile;
var Configuration = new quoterApp.Configuration();

/**
 * list_tube_info displays information about the queue.
 * @global
 * @name list_tube_info
 */


var hostName = Configuration.app.beanstalkd.host;
var port = Configuration.app.beanstalkd.port;
var tubeName = Configuration.app.tubeName;

var close_down_and_exit = function()
{
	console.log('Now closing down.');
	emitter.end();
	process.exit(0);
};

var emitter = new fivebeans.client(hostName, port);
emitter.on('connect', function()
{
	emitter.use(tubeName, function(err, tname)
	{
		console.log("using " + tname);
		emitter.stats_tube(tubeName, function(err, response) {
			console.log(JSON.stringify(response));
			close_down_and_exit();
		});
	});
});

emitter.connect();
