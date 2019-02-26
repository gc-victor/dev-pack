BINDIR=node_modules/.bin
JEST=$(BINDIR)/jest
LINT_STAGED=$(BINDIR)/lint-staged
MICROBUNDLE=$(BINDIR)/microbundle
ESLINT=$(BINDIR)/eslint
VERSION=$(shell node -p -e 'require("./package.json").version')

help :
	@echo "Available commands:"
	@echo ""
	@echo "  make dist\t\tbuild distribution files"
	@echo "  make format\t\tenforces a consistent style by parsing your code and re-printing it"
	@echo "  make lint\t\tlinting utility"
	@echo "  make lint-staged\trun linters against staged git files"
	@echo "  make release-minor\trelease a new minor version"
	@echo "  make release-major\trelease a new major version"
	@echo "  make test\t\texecute tests"
	@echo "  make test-watch\texecute test and watch them"
	@echo ""

.PHONY: coverage
coverage :
	if [ ! -d "./coverage" ]; then \
		echo "You have to execute 'make test' or 'make test-watch'" ; \
	else \
		cd coverage ; \
		python -m SimpleHTTPServer 8000 ; \
	fi ;\

.PHONY: dist
dist :
	rm -rf dist || exit $? ;\
	$(MICROBUNDLE) build --jsx --name react-from-core || exit $? ; \
	([ $$? -eq 0 ] && echo "✓ Builded distribution files" || exit 1) ;\

dist-watch :
	make dist || exit $? ;\
	$(MICROBUNDLE) watch --jsx --name react-from-core ;\

.PHONY: example
example :
	src/cli.js ;\

format :
	$(BINDIR)/prettier --write "src/**/*.js" ;\

lint :
	$(ESLINT) --fix || exit $? ; \
	echo "✓ Lint passed" ;\

lint-staged:
	$(LINT_STAGED)

release :
	git add -A || exit $? ;\
	git commit -m 'release: $(VERSION)' || exit $? ;\
	git push origin master || exit $? ;\
	git tag $(VERSION) || exit $? ;\
	git push --tags || exit $? ;\
	npm publish || exit $? ;\
	([ $$? -eq 0 ] && echo "✓ Released $(VERSION)" || exit 1) ;\

release-minor :
	make test || exit $? ;\
	make dist || exit $? ;\
	npm version minor || exit $? ;\
	make release || exit $? ;\
	([ $$? -eq 0 ] && echo "✓ Released new minor $(VERSION)" || exit 1) ;\

release-major :
	make test || exit $? ;\
	make dist || exit $? ;\
	npm version major || exit $? ;\
	make release || exit $? ;\
	([ $$? -eq 0 ] && echo "✓ Released new major $(VERSION)" || exit 1) ;\

test :
	$(JEST) ;\

test-watch :
	$(JEST) --watchAll ;\

watch :
	$(MICROBUNDLE) watch --name dev-pack ; \

# catch anything and do nothing
%:
	@:
