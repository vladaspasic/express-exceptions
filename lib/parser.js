"use strict";

/**
 * Parses the stack trace of the Error. The result will contain an array
 * of JSON objects with properties:
 *
 * name: This is the name of the function, or undefined if it is not named
 * filename: Location of the file which contain the function
 * line: Line number where the error broke out
 * column: Column line where it broke out
 * 
 * @param  {Error} error
 * @return {Array}
 */
function parse(error) {
	if (!error || !error.stack) return [];

	var stackTraces = error.stack.split('\n').map(createStackTrace);

	return stackTraces.filter(function(trace) {
		return trace;
	});
}

/**
 * Creates a JSON object out of the stack trace line.
 * 
 * @param  {String} stack Line stack
 * @return {Object}
 */
function createStackTrace(stack) {
	var match = stack.match(/at ([\(\)\w\.<>\[\]\s]+) \((.+):(\d+):(\d+)/);

	var fn, filename, line, col;

	if (!match) {
		match = stack.match(/at (.+):(\d+):(\d+)/);
		if (!match) return null;

		filename = match[1];
		line = Number(match[2]);
		col = Number(match[3]);
	} else {
		fn = match[1];
		filename = match[2];
		line = Number(match[3]);
		col = Number(match[4]);
	}

	return {
		name: fn,
		filename: filename,
		line: line,
		column: col
	};
}

module.exports.parse = parse;