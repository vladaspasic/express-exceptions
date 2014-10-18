"use strict";

var factory = require('./error');

module.exports.errors = {
	EvalError: factory.extend('EvalError'),
	InternalError: factory.extend('InternalError'),
	RangeError: factory.extend('RangeError'),
	ReferenceError: factory.extend('ReferenceError'),
	SyntaxError: factory.extend('SyntaxError'),
	TypeError: factory.extend('TypeError'),
	UriError: factory.extend('UriError'),
	RuntimeError: factory.extend('RuntimeError'),
	IllegalState: factory.extend('IllegalState'),
	NotImplemented: factory.extend('NotImplemented'),
	DatabaseError: factory.extend('DatabaseError'),
	WorkerError: factory.extend('WorkerError'),
	ValidationError: factory.extend('ValidationError', {
		logLevel: 'warn'
	}),
	BadRequest: factory.extend('BadRequest', {
		logLevel: 'warn',
		statusCode: 400
	}),
	Unauthorized: factory.extend('Unauthorized', {
		logLevel: 'warn',
		statusCode: 401
	}),
	NotFound: factory.extend('NotFound', {
		logLevel: 'warn',
		statusCode: 404
	}),
	Forbidden: factory.extend('Forbidden', {
		logLevel: 'warn',
		statusCode: 403
	}),
	NotAcceptable: factory.extend('Not Acceptable', {
		logLevel: 'warn',
		statusCode: 406
	})
};