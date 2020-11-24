run:
	+$(MAKE) -C app run

init:
	+$(MAKE) -C app init

build-ui:
	+$(MAKE) -C ui build

start-ui:
	+$(MAKE) -C ui start

test:
	+$(MAKE) -C app test
