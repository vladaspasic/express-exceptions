"use strict";

var path = require('path'),
	os = require('os'),
	fs = require('fs'),
	parser = require('../parser');

/**
 * Wraps an Error and prepares the data for rendering the exception report page.
 *
 * If the error arugment is not passed, an Error will be raised.
 *
 * @class ExceptionReport
 * @constructor
 * @param {Error}  error   An error for wich we want to create a report for
 * @param {Object} options
 */
function ExceptionReport(error, options) {
	if (!error || !(error instanceof Error))
		throw new Error('You must pass an Error as first argument');

	this.error = error;
	this.options = options || {};
}

/**
 * Generates meta data about the exception, system and the process.
 *
 * @method toJSON
 * @return {Object} JSON structure with the error and it's meta data.
 */
ExceptionReport.prototype.toJSON = function() {

	return {
		node: process.versions,
		ocurred: Date.now(),
		environment: collectProcessEnvironmentInfo(),
		process: collectProcessInfo(),
		system: collectSystemInfo(),
		exception: this.error,
		stackTrace: parser.parse(this.error)
	};
};

/**
 * Create a human readable exception output from toJSON method.
 *
 * @method toString
 * @returns {String}
 */
ExceptionReport.prototype.toString = function() {
	return JSON.stringify(this.toJSON(), null, 2)
		.replace(/\}/g, '')
		.replace(/\{/g, '');
};

/**
 * Collect process information
 *
 * @return {Object} Process information
 */
function collectProcessInfo() {
	var memory = process.memoryUsage();

	return {
		uptime: os.uptime(),
		title: process.title,
		active: {
			requests: process._getActiveRequests.length,
			handles: process._getActiveHandles.length
		},
		memory: {
			rss: toBytes(memory.rss),
			heap: {
				used: toBytes(memory.heapUsed),
				allocated: toBytes(memory.heapTotal)
			},
			native: toBytes(memory.rss - memory.heapTotal)
		},
		pid: process.pid,
		features: process.features,
	};
}

/**
 * Collect Process environment information
 *
 * @return {Object} Environment information
 */
function collectProcessEnvironmentInfo() {
	return {
		args: process.argv,
		node: process.execPath,
		cwd: process.cwd(),
		env: Object.keys(process.env).sort().reduce(function reassemble(memo, key) {
			memo[key] = process.env[key];
			return memo;
		}, {}),
		gid: process.getgid(),
		uid: process.getuid()
	};
}

/**
 * Collects data about the System
 *
 * @return {Object} System information
 */
function collectSystemInfo() {
	var load = os.loadavg(),
		cpus = os.cpus();

	return {
		platform: process.platform,
		arch: process.arch,
		hostname: os.hostname(),
		freemem: toBytes(os.freemem()),
		totalmem: toBytes(os.totalmem()),
		cpu: {
			load: {
				1: load[0],
				5: load[1],
				15: load[2]
			},
			cores: cpus.length,
			speed: cpus.reduce(function sum(memo, cpu) {
				return memo + cpu.speed;
			}, 0) / cpus.length,
			model: cpus[0].model
		}
	};
}

/**
 * Make the bytes human readable if needed.
 *
 * @param {Number} b Bytes
 * @returns {String|Number}
 */
function toBytes(b) {
	var tb = ((1 << 30) * 1024),
		gb = 1 << 30,
		mb = 1 << 20,
		kb = 1 << 10,
		abs = Math.abs(b);

	if (abs >= tb) return (Math.round(b / tb * 100) / 100) + 'TB';
	if (abs >= gb) return (Math.round(b / gb * 100) / 100) + 'GB';
	if (abs >= mb) return (Math.round(b / mb * 100) / 100) + 'MB';
	if (abs >= kb) return (Math.round(b / kb * 100) / 100) + 'KB';

	return b + 'b';
}

module.exports = ExceptionReport;