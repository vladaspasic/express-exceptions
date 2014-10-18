var request = require('supertest'),
	express = require('express'),
	chai = require('chai'),
	hbs = require('express-handlebars'),
	assert = chai.assert,
	expect = chai.expect;

var app = express();

app.engine('hbs', hbs({
	extname: '.hbs',
	defaultLayout: false
}));

app.set('view engine', 'hbs');
app.set('views', 'test/views');

app.get('/error', function(req, res){
	throw new Error('Simple Error Test');
});

app.get('/forbidden', function(req, res){
	throw new Forbidden('Forbidden Access');
});

app.use(require('../index')({
	environment: 'production',
	expose: true
},{
	Error: 'error',
	'Forbidden': 'forbidden'
}));

describe('Exception Selector', function() {

	it('#should render the error page', function(done) {
		request(app).get('/error').expect(500).expect(function(res) {
			expect(res.text).to.contain('<h1>Error</h1>');
			expect(res.text).to.contain('<p>Simple Error Test</p>');
		}).end(function(err) {
			done(err);
		});
	});

	it('#should render the forbidden error page', function(done) {
		request(app).get('/forbidden').expect(403).expect(function(res) {
			expect(res.text).to.contain('<h1>Forbidden</h1>');
			expect(res.text).to.contain('<p>Forbidden Access</p>');
		}).end(function(err) {
			done(err);
		});
	});

});