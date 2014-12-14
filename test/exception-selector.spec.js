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
	throw new ForbiddenError('Forbidden Access');
});

app.get('/badRequest', function(req, res){
	throw new BadRequestError('Bad Request');
});

app.get('/api/badRequest', function(req, res){
	throw new BadRequestError('Bad Request');
});

app.get('/handler/error', function(error, req, res) {
	throw new DatabaseError('Some DatabaseError.');
});

app.use('/api/*', require('../index')({
	showExceptionPage: false
}, {
	Error: function(error, req, res, next) {
		return res.json(error);
    }
}));

app.use('/handler/*', require('../index')(function(error, req, res, next) {
	return res.json(error);
}));

app.use(require('../index')({
	environment: 'production',
	expose: true
}, {
	Error: 'error',
	'Forbidden': 'forbidden',
	BadRequest: function(error, req, res) {
		return res.json(error);
	}
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

	it('#should render json BadRequest error', function(done) {
		request(app).get('/badRequest').expect(400).end(done);
	});

	it('#should render the json error page', function(done) {
		request(app).get('/api/badRequest').expect(400).expect(function(res) {
			expect(res.body).to.have.property('message').and.equal('Bad Request');
			expect(res.body).to.have.property('name').and.equal('Bad Request');
			expect(res.body).to.have.property('statusCode').and.equal(400);
			expect(res.body).to.have.property('stack').and.to.have.length.above(10);
		}).end(function(err) {
			done(err);
		});
	});

	it('#should render the DatabaseError page', function(done) {
		request(app).get('/handler/error').expect(500).expect(function(res) {
			expect(res.body).to.have.property('message').and.equal('Some DatabaseError.');
			expect(res.body).to.have.property('name').and.equal('DatabaseError');
			expect(res.body).to.have.property('statusCode').and.equal(500);
			expect(res.body).to.have.property('stack').and.to.have.length.above(10);
		}).end(function(err) {
			done(err);
		});
	});

});