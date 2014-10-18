var request = require('supertest'),
	express = require('express'),
	chai = require('chai'),
	assert = chai.assert,
	expect = chai.expect;

var app = express();

app.get('/error', function(req, res){
	throw new Error('Simple Error Test');
});

app.get('/badrequest', function(req, res){
	throw new BadRequest('Simple Error Test');
});

app.use(require('../index')());

describe('Exception Report Page', function() {

	it('#should render Error', function(done) {
		testResponse('/error', 'Error', 500, 'Simple Error Test', 10, done);
	});

	it('#should render BadRequest', function(done) {
		testResponse('/badrequest', 'BadRequest', 400, 'Simple Error Test', 14, done);
	});

});

function testResponse(page, name, statusCode, message, line, done) {
	return request(app).get(page).expect(statusCode).expect(function(res) {
		expect(res.text).to.contain(message);
		expect(res.text).to.contain('<h2>'+name+'</h2>');
		expect(res.text).to.contain('<p>'+message+'</p>');
		expect(res.text).to.contain('/Users/vspasic/Sites/express-exception-report/test/exception-report.spec.js');
	}).end(done);
}