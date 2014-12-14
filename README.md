express-exceptions [![Build Status](https://travis-ci.org/vladaspasic/express-exceptions.svg)](https://travis-ci.org/vladaspasic/express-exceptions) [![Coverage Status](https://img.shields.io/coveralls/vladaspasic/express-exceptions.svg)](https://coveralls.io/r/vladaspasic/express-exceptions)
==================

Express middleware for handling Errors in both production and development mode.

This package comes with an exception reporting page, showing all types of information about the Error,
where did it happen, your environment and system information. This report page is shown only if the 
application is running in development mode.

Here you can see the exception page example:

![Screenshot](http://s4.postimg.org/h5bzo0uzx/exception_report.png?raw=true)

When running in production mode, it offers a Error page selection. This means that for different Error types
you can show a different page.

This module was inspired by the [node-verror](https://github.com/davepacheco/node-verror) and [exception](https://github.com/observing/exception).

Installation
-------------

```javascirpt
npm install express-exceptions --save
```

## Usage

The usual setup of the module is to used it like a middleware. The exceptions variable is a function, that accepts 2 arguments, options object and the configuration object for the Error pages.

To use defaults just set it up with no arguments passed:


```javascirpt
var express = require('express'),
    exceptions = require('express-exceptions');
    
    
var app = express();

app.use(exceptions());

```

### options

##### exposeErrors

This property tells the module should it expose custom Errors to the global scope. Default: `true`

Read more about exposing errors in [error-globals](https://github.com/vladaspasic/error-globals)

##### logger

Attach a Logger instance that used by the application, so the module can automatically log errors.
By default it is a `noop` function.

##### pagePrefix

If all the pages are located in a seperate folder, here you can define that folder prefix. Default: `''`

##### showExceptionPage

If you do not wish to show an Exception Report page, set this to `false`. Default: `true`.

##### defaultErrorPage

Set a default Error page to be render, when an Error occurrs in `production` mode. Default: `error`

##### environment

Set the `node` environment. By default it checks if the `process.env.NODE_ENV` is set or it fallbacks to `development`

### Configuration

This is the configaration object for selecting the Error pages. The key can be a String representing a name of the Error or the Error class itself. A value can be a `String`, representing the name of the page to be render by the Express Response, or it can be a `Function` that will be invoked from the module to enable specific error handling.

```javascirpt

{
 'BadRequest': 'badRequestErrorPage',
 RuntimeError: function myCustomHandler(error, request, response, next) {
  error.property = 'my custom property';
  delete error.stack;
  
  res.json(error);
 }
}

```

If we want to configure it, so it will use the `console` as the log output, and all the error pages are located in a 
`views/errors` folder, and we have a error page selector configuration, we would do something like this.

```javascirpt
var express = require('express'),
    exceptions = require('express-exceptions');
    
    
var app = express();

app.use(exceptions({
    logger: console,
    pagePrefix: 'errors'
}, {
    'NotFound': '404',
    'UnauthorizedError': 'unauthorized',
    'ForbiddenError': 'unauthorized'
}));

```

You can use this middleware more than once. Let's say that you have some REST routes in your application, and you do not want to show an HTML page, you can do something like this.

```javascirpt
var express = require('express'),
    exceptions = require('express-exceptions');
    
    
var app = express();

// Use only when an error occurs on routes that start with /api/
app.use('/api/*', exceptions({
  showExceptionPage: false
}, {
  'Error': function(error, req, res, next) {
    
    // toJSON method will be invoked automatically
    return res.json(error);
  }
}
}));

// Use this as a default
app.use(exceptions());

```

This module also exposes:

### exceptions.create(name, settings)

Type: ```Function```

Returns: ```Error```

This function creates a custom Error. Name argument is required. Settings default to:

- logLevel: 'error'
- statusCode: 500
- init: noop

```javascirpt

var exceptions = require('express-exceptions');

exceptions.create('MyCustomError', {
 logLevel: 'warn',
 statusCode: 500,
 init: function () {
  // custom initialization code
 }
})

```

For more information visit [error-globals](https://github.com/vladaspasic/error-globals)

### exceptions.exceptionPageHandler(error, request, response, next)

Type: ```Function```

This function renders the exception page report. If you only want to have exception during development stage, this is the function you should add to your middleware.

```javascirpt

var express = require('express'),
    exceptions = require('express-exceptions');
    
    
var app = express();

app.use(exceptions.exceptionPageHandler);

```

License
----

Version 2.0
