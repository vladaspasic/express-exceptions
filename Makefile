test:
	@./node_modules/.bin/mocha -R spec -r chai --recursive

.PHONY: test