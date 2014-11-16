"use strict";

var _ = require('lodash'),
	assert = require('assert'),
	extsprintf = require('extsprintf'),
	report = require('./report');

/**
 * Exception Pages Selector class that renders the Error pages. If the Application is
 * running in 'production' mode, it will try to render an Error page, that was
 * configured.
 *
 * In 'development' mode, this will render the Exception report page.
 *
 * If no configration argument is provided, an AssertionError will be raised.
 *
 * @class ErrorPageSelector
 * @constructor
 * @param {Object} configuration Configuration containg the error page configuration.
 * @param {Object} options
 */
var ErrorPageSelector = function(configuration, options) {
	assert(configuration, "You must define a configuration for the Error Selector.");
	assert(typeof configuration === 'object', "Configuration must be an Object");

	this.configuration = setupConfiguration(configuration);

	this.options = _.defaults(options || {}, {
		defaultErrorPage: 'error',
		pagePrefix: '',
		showExceptionPage: true,
		environment: 'development',
		logger: _.noop
	});
};

/**
 * Checks if the Application is running in production mode
 *
 * @method isProductionMode
 * @return {Boolean}
 */
ErrorPageSelector.prototype.isProductionMode = function() {
	return this.options.environment === 'production';
};

/**
 * Renders the Error page. In case if the application is running in 'production' mode,
 * it searches the page name from the configuration. If it is not, it renders
 * the exception report page.
 *
 * @method render
 * @param  {Error}    error    An Error that occured
 * @param  {Request}  request  Express Request object
 * @param  {Response} response Express Response object
 * @param  {Function} next     Express middleware function
 */
ErrorPageSelector.prototype.render = function(error, request, response, next) {
	if (error.statusCode) {
		response.status(error.statusCode);

		var name = detectErrorName(error) || 'Error';
		var message = fmt('An %s occured while processing ["%s"]: %s', name, request.route.path, error.stack);

		log(this.options.logger, error.logLevel, message);
	}

	if (this.isProductionMode() || !this.options.showExceptionPage) {
		var page = this.get(error) || this.get('Error');

		if (page === undefined) {
			page = this.options.defaultErrorPage;
		}

		if (typeof page === 'function') {
			return page(error, request, response, next);
		}

		if (!_.isEmpty(this.options.pagePrefix)) {
			page = this.options.pagePrefix + '/' + page;
		}

		return response.render(page, {
			error: error
		});
	} else {
		return report.exceptionPageHandler(error, request, response, next);
	}
};

/**
 * Get the page name for the provided error key. Error argument must be
 * specified, or an Error will be raised.
 *
 * If the page can not be found, 'undefined' is returned.
 *
 * @method get
 * @param  {Error|String|Object} error [description]
 * @return {String}
 */
ErrorPageSelector.prototype.get = function(error) {
	assert(error, "No error key specified.");

	var key = resolveKeyFromType(error);

	if (key === undefined) return;

	return this.configuration[key];
};

/**
 * Checks if the key existis inside the Error Page Selector configuration.
 *
 * @method has
 * @param  {Error|String|Object}  error Error key which to check
 * @return {Boolean}              true if the config exists
 */
ErrorPageSelector.prototype.has = function(error) {
	return this.get(error) !== undefined;
};

/**
 * To string representation of the ErrorPageSelector. It returns a
 * toString configuration object.
 *
 * @method toString
 * @return {String}
 */
ErrorPageSelector.prototype.toString = function() {
	return this.configuration.toString();
};

/**
 * Setup the provided configuration
 *
 * @param  {Object} configuration
 * @return {Object} parsed configuration
 */
function setupConfiguration(configuration) {
	var config = {};

	_.each(configuration, function(page, type) {
		var key = resolveKeyFromType(type);

		if (key === undefined) {
			throw new Error('Can not detect Error name/type for the key: ' + type);
		}

		config[key] = page;
	});

	return config;
}

/**
 * Resolves the key as a string
 * @param  {Object|Function|String} type
 * @return {String}
 */
function resolveKeyFromType(type) {
	var key;

	if (typeof type === 'string') {
		key = type;
	} else if (typeof type === 'function') {
		key = detectErrorName(type);
	} else if (typeof type === 'object') {
		key = type.name;
	}

	return key;
}

/**
 * Detects the name of the Error by checking the constructor property from the Error prototype.
 *
 * @param  {Error} error
 * @return {String} name of the error or undefined if it can not be resolved
 */
function detectErrorName(error) {
	assert(error, "Error object must be passed to detect it's name.");

	if (error.name) return error.name;

	if (error.constructor) {
		return error.constructor.name || error.constructor.prototype.name;
	}
}

/**
 * A helper function for logging
 *
 * @param  {Object} logger  A logger instance
 * @param  {Srting} level   Logger level
 * @param  {String} message Message to be logged out
 */
function log(logger, level, message) {
	if (!logger || typeof logger[level] !== 'function') return;

	return logger[level](message);
}

/**
 * Helper function for formating messages using extsprintf module
 *
 * @return {String} Formated message
 */
function fmt() {
	return extsprintf.sprintf.apply(extsprintf, arguments);
}

module.exports = ErrorPageSelector;