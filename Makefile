run:
	+$(MAKE) -C app run

init:
	+$(MAKE) -C app init

build:
	+$(MAKE) -C app build
	+$(MAKE) -C ui build

start-ui:
	+$(MAKE) -C ui start

test:
	+$(MAKE) -C app test
