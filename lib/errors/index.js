"use strict";

var factory = require('./error'),
	defaults = require('./defaults'),
	_ = require('lodash');

/**
 * Exposes the default Errors to the global scope.
 */
module.exports.expose = function() {
	_.each(defaults.errors, function(error, name) {
		define(global, name, error);
	});
};

/**
 * Create a new Error
 *
 * @param  {String} name    Name for the Error
 * @param  {Object} options Options for the Error object
 * @return {Error}          A new error class
 */
module.exports.create = function(name, options) {
	return factory.extend(name, options);
};

/**
 * Expose Default Errors to the Module
 */
_.each(defaults.errors, function(error, name) {
	define(module.exports, name, error);
});

/**
 * Defines the Error property to a target Object, making it read-only,
 * not condifurable and non enumerable.
 *
 * @param  {Object} target Target object which will have the property
 * @param  {String} name   Name of the property
 * @param  {Object} value  Value of the property
 */
function define(target, name, value) {
	Object.defineProperty(target, name, {
		value: value,
		enumerable: false,
		configurable: false,
		writable: false
	});
}