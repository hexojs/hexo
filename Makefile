REPORTER ?= dot

build: css js

test:
	node test --reporter $(REPORTER)

install:
	npm install
	git submodule update --init

css:
	node build/css

js: bower

bower:
	./node_modules/.bin/bower install

.PHONY: test css