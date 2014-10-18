var fs = require("fs");
var sys = require("sys");

exports.FileLineReader = function FileLineReader(filename, bufferSize) {
	if (!bufferSize) {
		bufferSize = 8192;
	}

	//private:
	var currentPositionInFile = 0;
	var buffer = "";

	// return -1
	// when EOF reached
	// fills buffer with next 8192 or less bytes
	var fillBuffer = function(position) {
		if(!fd) return '';

		var res = fs.readSync(fd, bufferSize, position, "ascii");

		buffer += res[0];
		if (res[1] == 0) {
			return -1;
		}
		return position + res[1];

	};

	currentPositionInFile = fillBuffer(0);

	//public:
	this.hasNextLine = function() {
		while (buffer.indexOf("\n") == -1) {
			currentPositionInFile = fillBuffer(currentPositionInFile);
			if (currentPositionInFile == -1) {
				return false;
			}
		}

		if (buffer.indexOf("\n") > -1) {

			return true;
		}
		return false;
	};

	//public:
	this.nextLine = function() {
		var lineEnd = buffer.indexOf("\n");
		var result = buffer.substring(0, lineEnd);

		buffer = buffer.substring(result.length + 1, buffer.length);
		return result;
	};

	this.readLines = function(from, to) {
		if(!fd) return null;

		var lines = [], loc = 0;

		while (this.hasNextLine()) {
			++loc;
			lines.push({
				line: loc,
				content: this.nextLine()
			});
		}

		return lines;
	};

	if(!fs.existsSync(filename)) return this;

	var fd = fs.openSync(filename, "r");

	return this;
};