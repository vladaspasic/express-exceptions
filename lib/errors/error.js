var assert = require('assert'),
	extsprintf = require('extsprintf'),
	_ = require('lodash'),
	parser = require('../parser'),
	util = require('util');

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
 * @type {Function}
 */
Error.prototype.init = _.noop;

/**
 * HTTP Status code for this Error, defaults to 500
 *
 * @type {Number}
 */
Error.prototype.statusCode = 500;

/**
 * Log level for the Error, defaults log level is 'error'.
 *
 * @type {String}
 */
Error.prototype.logLevel = 'error';

/**
 * String representation of the Error
 *
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
 * @return {Error} An error object that caused the Error
 */
Error.prototype.cause = function cause() {
	return (this.jse_cause);
};

/**
 * JSON representation of the Error. This object will show the Error name, message,
 * stack trace as an list of Objects defining the line, location, function name and
 * a cause, if exists.
 *
 * @return {Object}
 */
Error.prototype.toJSON = function() {
	return {
		name: getErrorName(this),
		message: this.message,
		statusCode: this.statusCode,
		logLevel: this.logLevel,
		stack: parser.parse(this),
		cause: (this.jse_cause && typeof this.jse_cause.toJSON === 'function') ?
			this.jse_cause.toJSON() : this.jse_cause
	};
};

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