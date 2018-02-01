SHELL=/bin/bash
NODE_BIN=./node_modules/.bin

none:
	@echo 'Nothing to do' && exit 1

install:
	yarn install

eslint:
	$(NODE_BIN)/eslint src/

webext-run:
	$(NODE_BIN)/web-ext run

webext-lint:
	$(NODE_BIN)/web-ext lint
