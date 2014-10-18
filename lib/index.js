var errors = require('./errors'),
	report = require('./report'),
	extsprintf = require('extsprintf'),
	ErrorPageSelector = require('./error-page-selector'),
	_ = require('lodash');

function nodeExceptionReport(options, configuration) {
	options = _.defaults(options || {}, {
		exposeErrors: true,
		logger: _.noop,
		defaultErrorPage: 'error',
		environment: process.env.NODE_ENV || 'development'
	});

	if (options.exposeErrors) {
		errors.expose();
	}

	var errorPageSelector = new ErrorPageSelector(configuration || {}, options);

	return function(error, req, res, next) {
		try {
			return errorPageSelector.render.apply(errorPageSelector, arguments);
		} catch(e) {
			return next(e);
		}
	};
}

nodeExceptionReport.create = errors.create;
nodeExceptionReport.exceptionPageHandler = report.exceptionPageHandler;

module.exports = nodeExceptionReport;