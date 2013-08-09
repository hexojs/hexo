TESTS = test/*.js
REPORTER = spec

all: install css

test:
	@./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		$(TESTS)

install:
	npm install
	git submodule update --init

css:
	compass compile -e production --force

css-watch:
	compass watch

.PHONY: test css css-watch