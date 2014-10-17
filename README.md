express-exceptions
==================

Express middleware for handling Errors in both production and development mode.

This package comes with an exception reporting page, showing all types of information about the Error,
where did it happen, your environment and system information. This report page is shown only if the 
application is running in development mode.

When running in production mode, it offers a Error page selection. This means that for different Error types
you can show a different page.

This module comes with a predefined set of custom errors.

- TypeError
- EvalError
- InternalError
- RangeError
- ReferenceError
- SyntaxError
- UriError
- RuntimeError
- IllegalState
- NotImplemented
- DatabaseError
- WorkerError
- ValidationError
- BadRequest
- Unauthorized
- NotFound
- Forbidden
- NotAcceptable
 
Installation
--------------

```javascirpt
npm install express-exceptions --save
```

