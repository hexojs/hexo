REPORTER ?= dot

all: install css

test:
	node test --reporter $(REPORTER)

install:
	npm install
	git submodule update --init

css:
	compass compile -e production --force

css-watch:
	compass watch

.PHONY: test css css-watch