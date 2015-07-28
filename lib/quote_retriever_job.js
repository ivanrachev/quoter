(function () {
'use strict'
var quoterApp = require('./index');

var Database = quoterApp.Database;
var WebCrawler = quoterApp.WebCrawler;
var JobMissile = quoterApp.JobMissile;
var JobDispatcher = quoterApp.JobDispatcher;
var Configuration = new quoterApp.Configuration();


var process_success = function(payload) 
{
	var newSuccessfulJobMissile = new JobMissile();
	// clone the payload to prevent unconrolled manipulation 
	// from another function
	newSuccessfulJobMissile.payload = JSON.parse(JSON.stringify(payload)); 
	newSuccessfulJobMissile.payload.successfulRunsCount++;
	
	if (newSuccessfulJobMissile.payload.successfulRunsCount >= 
		Configuration.app.job.maxSuccessfulRuns)
	{
		var payloadToBeDeleted = JSON.stringify(newSuccessfulJobMissile.payload);
		console.log('Configuration.app.job.maxSuccessfulRuns (' 
					+ Configuration.app.job.maxSuccessfulRuns 
					+ ') reached. So, job deleted. Deleted payload: ' 
					+ payloadToBeDeleted );
		return; 
	}

	var jobDispatcher = new JobDispatcher();
	jobDispatcher.rePutSuccessfulJob(newSuccessfulJobMissile, 
		function(newSuccessfulJobMissile){ return function() 
		{
			console.log('reput successful job: ' + 
						JSON.stringify(newSuccessfulJobMissile));
	}; } (newSuccessfulJobMissile) );
}

var process_failure = function(payload) 
{
	var newFailedJobMissile = new JobMissile();
	// clone the payload to prevent unconrolled manipulation 
	// from another function
	newFailedJobMissile.payload = JSON.parse(JSON.stringify(payload)); 
	newFailedJobMissile.payload.failedRunsCount++;
	
	if (newFailedJobMissile.payload.failedRunsCount >= 
		Configuration.app.job.maxFailedRuns)
	{
		var payloadToBeDeleted = JSON.stringify(newFailedJobMissile.payload);
		console.log('Configuration.app.job.maxFailedRuns (' 
					+ Configuration.app.job.maxFailedRuns 
					+ ') reached. So, job deleted. Deleted payload: ' 
					+ payloadToBeDeleted );
		return; 
	}
	
	var jobDispatcher = new JobDispatcher();
	jobDispatcher.rePutSuccessfulJob(newFailedJobMissile, 
		function(newFailedJobMissile){ return function()
		{
			console.log('reput failed job: ' + 
						JSON.stringify(newFailedJobMissile));
	}; } (newFailedJobMissile) );
}


module.exports = function()
{
	/**
	 * @class
	 * @name QuoteRetrieverHandler
	 * @classdesc QuoteRetrieverHandler is a callback object that 
	 * processes jobs from queue.
	 */
	function QuoteRetrieverHandler()
	{
		this.type = Configuration.app.job.type;
	}

	/**
	 * @description Processes a job and if necessary, packages the 
	 * jobs payload into a new job and puts the new job into the queue.
	 * @param {Object} payload - the job itself. See {@link JobMissile}.
	 * @param {QuoteRetrieverHandler~callback} callback - The callback 
	 * that removes the currectly processed job from the queue.
	 */
	QuoteRetrieverHandler.prototype.work = function(payload, callback)
	{
		console.log('QuoteRetrieverHandler payload: ' 
		            + JSON.stringify(payload));

		var crawler = new WebCrawler();
		crawler.getQuote(function (payload) { return function (err, quote) 
		{ 
			if (err)
			{
				console.log('error while crawling: ' + err);
				process_failure(payload);
				return;
			}

			var db = new Database();
			db.insertQuote(quote, function (payload) { return function(err) 
			{
				if (err)
				{
					console.log('error while inserting: ' + err);
					process_failure(payload);
					return;
				}
				process_success(payload);
			}; }(payload) );

		}; }(payload) );
		
		callback('success');
	};

	var handler = new QuoteRetrieverHandler();
	return handler;
};

/**
 * @callback QuoteRetrieverHandler~callback
 */

})();