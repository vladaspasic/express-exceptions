var chai = require('chai'),
	errors = require('../lib/errors');

var assert = chai.assert,
	expect = chai.expect;

/**
 * Creates a new Error instance
 */
function createError(name, message, options) {
	var E = errors.create(name, options || {});

	return new E(message);
}

/**
 * Throws an error
 */
function throwError(type, message) {
	if(!errors[type]) return;

	throw new errors[type](message);
}

describe('errors', function(){

	before(function() {
		errors.expose();
	});

	describe('#create', function() {

		it('should create new Error type with default options', function() {
			var error = createError('MyError', 'Some message');

			expect(error).to.have.property('name').and.equal('MyError');
			expect(error).to.have.property('message').and.equal('Some message');
			expect(error).to.have.property('statusCode').and.equal(500);
			expect(error).to.have.property('logLevel').and.equal('error');
		});

		it('should create new Error type with custom options', function() {
			var error = createError('MyError', 'Some message', {
				logLevel: 'debug',
				statusCode: 400,
				init: function() {
					this.prop = 'some prop';
				}
			});

			expect(error).to.have.property('name').and.equal('MyError');
			expect(error).to.have.property('message').and.equal('Some message');
			expect(error).to.have.property('statusCode').and.equal(400);
			expect(error).to.have.property('logLevel').and.equal('debug');
			expect(error).to.have.property('prop').and.equal('some prop');
		});

		it('should create new Error with a cause', function() {
			var cause = createError('Cause', 'Cause of the error');
			var error = new errors.TypeError(cause, 'Main error');

			expect(error).to.have.property('name').and.equal('TypeError');
			expect(error).to.have.property('message').and.equal('Main error: Cause of the error');
			expect(error).to.have.property('statusCode').and.equal(500);
			expect(error).to.have.property('logLevel').and.equal('error');
		});

	});

	describe('#toJSON', function() {

		it('should have stack trace as a JSON', function() {
			var error = createError('MyError', 'Some message');

			var json = error.toJSON();
			
			assert.isArray(json.stack, 'Stack is not an array');
			expect(json.stack[0]).to.have.property('filename').to.be.a('string');
			expect(json.stack[0]).to.have.property('line').to.be.a('number');
			expect(json.stack[0]).to.have.property('column').to.be.a('number');
		});

		it('should have a cause', function() {
			var cause = createError('MyError', 'Some message');
			var error = new errors.TypeError(cause, 'Main error');

			var json = error.toJSON();

			assert.ok(json.cause, 'cause is not defined');
			assert.notOk(json.cause.cause, 'cause has an another cause');
			expect(json.cause).to.have.property('name').and.equal('MyError');
			expect(json.cause).to.have.property('message').and.equal('Some message');
			expect(json.cause).to.have.property('statusCode').and.equal(500);
			expect(json.cause).to.have.property('logLevel').and.equal('error');
		});

	});

	describe('#stackTrace', function() {

		it('should render stack trace with no cause', function() {
			var error = createError('MyError', 'Some message');

			var trace = error.stackTrace();

			expect(trace).to.contain(__dirname + '/errors.spec.js:13');
			expect(trace).to.contain(__dirname + '/errors.spec.js:102');
		});

		it('should render stack trace with a cause', function() {
			var cause = createError('MyError', 'Some message');
			var error = new errors.TypeError(cause, 'Main error');

			var trace = error.stackTrace();

			expect(trace).to.contain(__dirname + '/errors.spec.js:13');
			expect(trace).to.contain(__dirname + '/errors.spec.js:112');
			expect(trace).to.contain('Caused by: MyError: Some message');
			expect(trace).to.contain(__dirname + '/errors.spec.js:13');
			expect(trace).to.contain(__dirname + '/errors.spec.js:111');
		});

	});
});