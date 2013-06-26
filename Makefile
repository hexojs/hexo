TESTS = test/*
REPORTER = spec

test:
	@./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--timeout 60000 \
		--slow 30000 \
		$(TESTS)

css:
	compass compile -e production --force

.PHONY: test