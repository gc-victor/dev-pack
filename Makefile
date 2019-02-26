BINDIR=node_modules/.bin
LINT_STAGED=$(BINDIR)/lint-staged
ESLINT=$(BINDIR)/eslint
VERSION=$(shell node -p -e 'require("./package.json").version')

help :
	@echo "Available commands:"
	@echo ""
	@echo "  make format\t\tenforces a consistent style by parsing your code and re-printing it"
	@echo "  make lint\t\tlinting utility"
	@echo "  make lint-staged\trun linters against staged git files"
	@echo "  make release-minor\trelease a new minor version"
	@echo "  make release-major\trelease a new major version"
	@echo ""

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
	npm version minor || exit $? ;\
	make release || exit $? ;\
	([ $$? -eq 0 ] && echo "✓ Released new minor $(VERSION)" || exit 1) ;\

release-major :
	npm version major || exit $? ;\
	make release || exit $? ;\
	([ $$? -eq 0 ] && echo "✓ Released new major $(VERSION)" || exit 1) ;\

# catch anything and do nothing
%:
	@:
