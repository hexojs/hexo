TESTS = test/*
REPORTER = spec

all: css

test:
	@./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--timeout 60000 \
		--slow 30000 \
		$(TESTS)

install:
	npm install

css:
	compass compile -e production --force

css-watch:
	compass watch