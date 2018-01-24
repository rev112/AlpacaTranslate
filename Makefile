none:
	@echo 'Nothing to do' && exit 1

install:
	yarn install

eslint:
	./node_modules/.bin/eslint src/
