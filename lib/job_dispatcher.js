(function () {
'use strict'
var quoterApp = require('./index');

var assert = quoterApp.assert;
var fivebeans = quoterApp.fivebeans;
var Configuration = new quoterApp.Configuration();

/**
 * @todo manage disconnect to beanstalkd
 */

var put_job = function(delay, job, callbackPut) 
{
	var tubeName = Configuration.app.tubeName;
	var priority = Configuration.app.job.priority;
	var timeToRun = Configuration.app.job.timeToRun;
	var emitter = JobDispatcher.prototype.emitter;
	var payload = JSON.stringify([tubeName, job]);
	
	emitter.put(priority, delay, timeToRun, payload, 
				function(delay, callbackPut){ return function(err, jobid)
	{
		console.log('queued a Quote job into tube:'+ tubeName 
					+ ' jobid: ' + jobid 
					+ ' with delay: ' + delay);
		callbackPut();
	}; } (delay, callbackPut) );
}

/**
 * @class 
 * @name JobDispatcher
 * @classdesc JobDispatcher always stays connected to the queue 
 * and re-inserts jobs. JobDispatcher does not retrieve jobs from 
 * the queue.
 */
var JobDispatcher = function()
{
};

/**
 * connect to beanstalkd in order to put jobs into beanstalkd 
 * @param {JobDispatcher~callback} callbackConnected - The callback 
 * that handles the response.
 */
JobDispatcher.prototype.connectToBeanstalkd = function(callbackConnected)
{
	var hostName = Configuration.app.beanstalkd.host;
	var port = Configuration.app.beanstalkd.port;
	var tubeName = Configuration.app.tubeName;

	var emitter = new fivebeans.client(hostName, port);
	JobDispatcher.prototype.emitter = emitter;
	
	emitter.on('connect', function()
	{
		console.log('JobDispatcher connected');
		emitter.use(tubeName, function(err, tname)
		{
			console.log("JobDispatcher using tube:" + tname);
			callbackConnected();
		});
	});
	emitter.connect();
}

/**
 * Puts an existing job that completed successfully back into the queue
 * @param {JobDispatcher~callback} callbackPut - The callback that handles the response.
 * @param {Object} job - Job to enqueue. Job does not conform to any format.
 */
JobDispatcher.prototype.rePutSuccessfulJob = function(job, callbackPut) 
{
	var delay = Configuration.app.job.delayOnSuccess;
	put_job(delay, job, callbackPut);
}

/**
 * Puts an existing job that failed back into the queue
 * @param {JobDispatcher~callback} callbackPut - The callback that handles the response.
 * @param {Object} job - Job to enqueue. Job does not conform to any format.
 */
JobDispatcher.prototype.rePutFailedJob = function(job, callbackPut)
{
	var delay = Configuration.app.job.delayOnFailure;
	put_job(delay, job, callbackPut);
}

/**
 * @callback JobDispatcher~callback
 */

module.exports = JobDispatcher;

})();