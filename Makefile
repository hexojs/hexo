test:
	gulp test

install:
	npm install
	git submodule update --init

.PHONY: test