'use strict'
exports.assert = require('assert');
exports.fs = require('fs');
exports.http = require('http');

exports.fivebeans = require('fivebeans');
exports.yaml = require('js-yaml');
exports.mongodb = require('mongodb');

exports.argv = require('yargs')
    .usage('Usage: worker --id=[ID] --config=[config.yml]')
    .default('id', 'defaultID')
    .default('config', 'config.yml')
    .argv;

// configuration needs to be after argv since it uses 
// config file name from argv
exports.Configuration = require('./configuration');

exports.JobMissile = require('./job_missile');
exports.JobDispatcher = require('./job_dispatcher');
exports.Database = require('./database');
exports.WebCrawler = require('./web_crawler');
