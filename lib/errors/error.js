var assert = require('assert'),
	extsprintf = require('extsprintf'),
	_ = require('lodash'),
	parser = require('../parser'),
	util = require('util');

var productionMode = (process.env.NODE_ENV || '').toLowerCase(),
	isProductionMode = 'production' === productionMode;

//
// Bump the stackTraceLimit in development, 10 is way to low but setting it
// higher would make the process run slower.
if (!isProductionMode) {
  Error.stackTraceLimit = Error.stackTraceLimit !== 10 ? Error.stackTraceLimit : 25;
}

/**
 * Extending the Error prototype
 *
 * @param name
 * @param errorCode [optional]
 * @returns {AbstractError}
 */

Error.extend = function(name, proto) {
	assert(name, 'You have to define an name for an Error.');

	proto = _.defaults(proto || {}, {
		statusCode: 500,
		logLevel: 'error',
		init: _.noop
	});

	/**
	 * Abstract Error Class used to build each Error with a custom prototype properties
	 * and a constructor.
	 */
	var Exception = function Exception(options) {
		if (!this instanceof Exception) {
			return new arguments.callee(arguments);
		}

		var args, causedBy, ctor, tailmsg;

		if (options instanceof Error || typeof(options) === 'object') {
			args = Array.prototype.slice.call(arguments, 1);
		} else {
			args = Array.prototype.slice.call(arguments, 0);
			options = undefined;
		}

		tailmsg = args.length > 0 ? extsprintf.sprintf.apply(null, args) : '';
		this.jse_shortmsg = tailmsg;
		this.jse_summary = tailmsg;

		if (options) {
			causedBy = options.cause;

			if (!causedBy || !(options.cause instanceof Error))
				causedBy = options;

			if (causedBy && (causedBy instanceof Error)) {
				this.jse_cause = causedBy;
				this.jse_summary += ': ' + causedBy.message;
			}
		}

		this.message = this.jse_summary;
		Error.call(this, this.jse_summary);

		this.init.apply(this, arguments);

		if (Error.captureStackTrace) {
			ctor = options ? options.constructorOpt : undefined;
			ctor = ctor || arguments.callee;
			Error.captureStackTrace(this, ctor);
		}
	};

	util.inherits(Exception, this);

	Exception.extend = this.extend;
	Exception.prototype.name = name;
	Exception.prototype.init = proto.init;
	Exception.prototype.logLevel = proto.logLevel;
	Exception.prototype.statusCode = proto.statusCode;

	return Exception;

};

/**
 * Constructor function that is invoked when the Error is thrown.
 * Defaults to noop function.
 *
 * @method init
 * @type {Function}
 */
Error.prototype.init = _.noop;

/**
 * HTTP Status code for this Error, defaults to 500
 *
 * @property statusCode
 * @type {Number}
 */
Error.prototype.statusCode = 500;

/**
 * Log level for the Error, defaults log level is 'error'.
 *
 * @property loglevel
 * @type {String}
 */
Error.prototype.logLevel = 'error';

/**
 * String representation of the Error
 *
 * @method toString
 * @return {String}
 */
Error.prototype.toString = function toString() {
	var str = getErrorName(this);
	if (this.message)
		str += ': ' + this.message;

	return (str);
};

/**
 * Get the cause if the Error
 *
 * @method cause
 * @return {Error} An error object that caused the Error
 */
Error.prototype.cause = function cause() {
	return (this.jse_cause);
};


/**
 * Returns the stack trace for this error, if the cause
 * exists for this error, it's stack trace will be appended
 * as well.
 *
 * @method stackTrace
 * @return {String}
 */
Error.prototype.stackTrace = function() {
	var stack = this.stack;

	if(this.jse_cause) {
		stack += '\nCaused by: ' + this.jse_cause.stackTrace();
	}

	return stack;
};

/**
 * Prints the stack trace of the Error to the stderr
 *
 * @method printStackTrace
 */
Error.prototype.printStackTrace = function() {
	var stackTrace = this.stackTrace();

	process.stderr.write(stackTrace + '\n');
};

/**
 * JSON representation of the Error. This object will show the Error name, message,
 * stack trace as an list of Objects defining the line, location, function name and
 * a cause, if exists.
 *
 * @method toJSON
 * @return {Object}
 */
Error.prototype.toJSON = function() {
	return isProductionMode ? toJsonProduction.call(this) : toJsonDev.call(this);
};

/*
 Used in production mode
 */
function toJsonProduction() {
	return {
		name: getErrorName(this),
		message: this.message,
		statusCode: this.statusCode
	};
}

/*
 Used in development mode
 */
function toJsonDev() {
	return {
		name: getErrorName(this),
		message: this.message,
		statusCode: this.statusCode,
		logLevel: this.logLevel,
		stack: parser.parse(this),
		cause: (this.jse_cause && typeof this.jse_cause.toJSON === 'function') ?
			this.jse_cause.toJSON() : this.jse_cause
	};
}

/**
 * Resolves the Error name
 *
 * @param  {Error}  error
 * @return {String}
 */
function getErrorName(error) {
	assert(error, "Error object must be passed to detect it's name.");

	if (error.name) return error.name;

	return error.constructor.name || error.constructor.prototype.name || 'Error';
}

module.exports = Error;