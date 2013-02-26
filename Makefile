TESTS = test/*
REPORTER = spec
CSS_DIR = assets/css
JS_DIR = assets/js

test:
	@./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--timeout 60000 \
		--slow 30000 \
		$(TESTS)

css:
	@./node_modules/.bin/stylus \
		--use ./node_modules/nib/lib/nib \
		--out public/css \
		--compress \
		$(CSS_DIR)

.PHONY: test css js