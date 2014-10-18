express-exceptions
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

##### logger

Attach a Logger instance that used by the application, so the module can automatically log errors.
By default it is a `noop` function.

##### pagePrefix

If all the pages are located in a seperate folder, here you can define that folder prefix. Default: `''`

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
    'Unauthorized': 'unauthorized',
    'Forbidden': 'unauthorized'
}));

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

### exceptions.exceptionPageHandler(error, request, response, next)

Type: ```Function```

This function renders the exception page report. If you only want to have exception during development stage, this is the function you should add to your middleware.

```javascirpt

var express = require('express'),
    exceptions = require('express-exceptions');
    
    
var app = express();

app.use(exceptions.exceptionPageHandler);


```


## Errors

All Errors have been customized got this module, and they now have a bit more properties now:

#### Error.cause()

Type: ```Function```

Returns: ```Error```

A method that returns a cause of the Error.

```javascirpt

var myError = new Error(new TypeError("An error occurred"));

myError.cause() --> 'TypeError: An error occured'

```

#### Error.init()

Type: ```Function```

Invoked by the constructor, usefull to do custom argument handling for the Error. This is a private function and it should not be invoked manually.

#### Error.toJSON()

Type: ```Function```

Returns: ```Object```

A method that returns a json representation of the Error.

```javascirpt

var myError = new Error("An error occurred");

myError.toJSON();

{ name: 'Error',
  message: 'An error occurred',
  statusCode: 500,
  logLevel: 'error',
  stack:  [ 
   { name: 'someFunctionName',
     filename: 'location/of/the/file',
     line: 91,
     column: 9
   },
   { 
    name: 'Context.<anonymous>',
    filename: 'location/of/the/file',
    line: 28,
    column: 10
   }
}
```

#### Error.toString()

Type: ```Function```

Returns: ```String```

Returns a to String representation of the Error in the format of Error.name: Error.message

```javascirpt

var myError = new Error("An error occurred");

myError.toString() -> 'Error: An error occurred'

```

#### Error.loggerLevel

Type: ```Property```

Returns: ```String```

A logger level for the Error

#### Error.statusCode

Type: ```Property```

Returns: ```Number```

HTTP status code for the Error

### Predefined Errors

This module comes with a predefined set of custom errors. All Errors have a `statusCode` and `loggerLevel` properties,
so we could easily set the status code of the response, and log the Error apropriatelly.



Here is a list of all defined Errors in the module:

- TypeError
  - statusCode: 500
  - loggerLevel: error
- EvalError
  - statusCode: 500
  - loggerLevel: error
- InternalError
  - statusCode: 500
  - loggerLevel: error
- RangeError
  - statusCode: 500
  - loggerLevel: error
- ReferenceError
  - statusCode: 500
  - loggerLevel: error
- SyntaxError
  - statusCode: 500
  - loggerLevel: error
- UriError
  - statusCode: 500
  - loggerLevel: error
- RuntimeError
  - statusCode: 500
  - loggerLevel: error
- IllegalState
  - statusCode: 500
  - loggerLevel: error
- NotImplemented
  - statusCode: 500
  - loggerLevel: error
- DatabaseError
  - statusCode: 500
  - loggerLevel: error
- WorkerError
  - statusCode: 500
  - loggerLevel: error
- ValidationError
  - statusCode: 500
  - loggerLevel: warn
- BadRequest
  - statusCode: 400
  - loggerLevel: warn
- Unauthorized
  - statusCode: 401
  - loggerLevel: warn
- Forbidden
  - statusCode: 403
  - loggerLevel: warn
- NotFound
  - statusCode: 404
  - loggerLevel: warn
- NotAcceptable
  - statusCode: 406
  - loggerLevel: warn

License
----

Version 2.0
