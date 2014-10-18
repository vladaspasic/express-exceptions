function renderLine(line) {
	return line.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/\s/g, '&nbsp;');
}

function renderErrorRowClass(first, second) {
	return first === second ? 'error' : '';
}

function toString(value) {
	if(typeof value === 'string') return value;

	try {
		return JSON.stringify(value);
	} catch(e) {
		if(typeof value.toString === 'function') return value.toString();

		return value;
	}
	
}

module.exports = {
	renderLine: renderLine,
	errorClass: renderErrorRowClass,
	toString: toString
};