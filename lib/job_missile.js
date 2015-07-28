(function () {
'use strict'
var quoterApp = require('./index');

var Configuration = new quoterApp.Configuration();

/**
 * @typedef {Object} JobMissile
 * @description missiles deliver nuclear payloads. 
 * So jobMissiles deliver job payloads :) and we launch 
 * jobMissiles through beanstalk tubes :) 
 * @property {string} type - type determines what handler 
 * on the receiving end will process the job.
 * @property {string} payload.UID - Unique ID across 
 * multiple executions of the same payload.
 * @property {string} payload.from - The from currency. 
 * @property {string} payload.to - The to currency.
 * @property {string} payload.successfulRunsCount - The 
 * number of successful executions so far for the payload.
 * @property {string} payload.successfulRunsCount - The 
 * number of failed executions so far for the payload.
 */
var JobMissile = function()
{
	this.type = Configuration.app.job.type;
	this.payload = 
	{
		UID: new Date().getTime(),
		from: "HKD",
		to: "USD",
		successfulRunsCount: 0,
		failedRunsCount: 0
	}
};

module.exports = JobMissile;

})();