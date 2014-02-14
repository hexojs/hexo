REPORTER ?= dot

build: css

test:
	node test --reporter $(REPORTER)

install:
	npm install
	git submodule update --init

css:
	node build/css

.PHONY: test css