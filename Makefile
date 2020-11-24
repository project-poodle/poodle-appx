run:
	+$(MAKE) -C app run

build:
	+$(MAKE) -C app build
	+$(MAKE) -C ui build

init:
	+$(MAKE) -C app init

start-ui:
	+$(MAKE) -C ui start

test:
	+$(MAKE) -C app test
