TESTS = test/*
REPORTER = spec

test:
	@./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		$(TESTS)

.PHONY: test