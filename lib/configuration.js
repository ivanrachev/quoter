(function () {
	
var quoterApp = require('./index');

var fs = quoterApp.fs;
var yaml = quoterApp.yaml;
var argv = quoterApp.argv;


var read_configuration = function(configpath)
{
	if (configpath[0] !== '/')
		configpath = process.cwd() + '/' + configpath;
	console.log('yaml config file ' + configpath);

	var config;
	
	if (fs.existsSync(configpath))
	{
		config = yaml.load(fs.readFileSync(configpath, 'utf8'));
	}
	else
	{
		console.log(configpath + ' does not exist');
		config = new Object();
	}

	if (!config.beanstalkd)
		config.beanstalkd = new Object();

	if (!config.beanstalkd.host)
		config.beanstalkd.host = 'locahost';
	if (!config.beanstalkd.port)
		config.beanstalkd.port = 13000;
	
	if (!config.watch)
		config.watch = new Array();
	
	if (!config.watch.length)
		config.watch[0] = 'default';
	
	config.tubeName = config.watch[0];
	
	if (!config.job)
		config.job = new Object();
	if (!config.job.type)
		config.job.type = 'quoteRetrieverJob';
	if (!config.job.priority)
		config.job.priority = 1000;
	if (!config.job.timeToRun)
		config.job.timeToRun = 20; // seconds
	if (!config.job.delayOnFailure)
		config.job.delayOnFailure = 3; // seconds
	if (!config.job.delayOnSuccess)
		config.job.delayOnSuccess = 60; // seconds
	if (!config.job.maxSuccessfulRuns)
		config.job.maxSuccessfulRuns = 10;
	if (!config.job.maxFailedRuns)
		config.job.maxFailedRuns = 3;
	
	console.log(JSON.stringify(config));
	
	return config;
}


/**
 * @class
 * @name Configuration
 * @classdesc Configuration represents a global set of configuration 
 * settings for the application. 
 */
var Configuration = function()
{
	if ( arguments.callee._singletonInstance )
		return arguments.callee._singletonInstance;
	
	this.app = read_configuration(argv.config);
	arguments.callee._singletonInstance = this;
};

module.exports = Configuration;

})();