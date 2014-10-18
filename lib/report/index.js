var	ExceptionReport = require('./exception-report'),
	lineReader = require('./line-reader'),
	helpers = require('./template/helpers'),
	_ = require('lodash');

/**
 * Create Handlebars Instance
 *
 * @type {Handlebars}
 */
var handlebars = require('express-handlebars').create({
	extname: '.hbs',
	helpers: helpers,
	partialsDir: __dirname + '/template/partials'
});

/**
 * Cache for loaded pages, needed by the getStackFiles method
 * 
 * @type {Object}
 */
var loaded = {};


/**
 * Renders the Exxception page template
 *
 * @param  {Exception} Exception that contains the information about the error
 * @return {Promise}   Promise from the Handlebars render method
 */
function renderTemplate(exception, req) {
	var data = exception.toJSON(),
		error = data.exception;

	while (error) {
		error.stackTrace = _.map(data.stackTrace, getStackFiles);
		error = error.jse_cause;
	}

	data.request = req;

	return handlebars.render(__dirname + '/template/exception-page.hbs', data);
}

/**
 * Reads the file for each Error stack line and returns an Array of file content rows.
 * 
 * @param  {Object} stackTrace Object that contains the filename and line where the error occured
 * @return {Object}            Extends the Stack trace object by adding the lines property, which
 *                             contains the content rows.
 */
function getStackFiles(stackTrace) {
	var lines = loaded[stackTrace.filename];

	if (_.isEmpty(lines)) {
		lines = new lineReader.FileLineReader(stackTrace.filename).readLines();

		if(!!lines) {
			loaded[stackTrace.filename] = lines;
		} else {
			return {};
		}
	}

	var fromIndex = (stackTrace.line > 15) ? (stackTrace.line - 15) : 0;
	var toIndex = (stackTrace.line + 15 > lines.length) ? lines.length : (stackTrace.line + 15);

	return _.extend(stackTrace, {
		lines: lines.slice(fromIndex, toIndex)
	});
}

/**
 * Exception page handler/middleware for Express application. This function will convert the
 * Error into an Exception, that will contain additional information about the current process and
 * environment.
 * 
 * @param  {Error}    error An error that occured
 * @param  {Request}  req   Node Request
 * @param  {Response} res   Node Response
 * @param  {Function} next  next middleware
 */
function exceptionPageHandler(error, req, res, next) {
	var exception = new ExceptionReport(error);

	renderTemplate(exception, req).then(function(buffer) {
		return res.send(buffer);
	}, function(e) {
		console.warn('Could not render Tempalte', e, e.stack);

		return res.json(exception.toJSON());
	});
}

module.exports = {
	exceptionPageHandler: exceptionPageHandler,
	ExceptionReport: ExceptionReport
};