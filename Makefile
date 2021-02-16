REPO=poodlehub
NAME=poodle-appx
VERSION=0.1

run:
	+$(MAKE) -C app run

build:
	+$(MAKE) -C app build
	+$(MAKE) -C ui build

init:
	+$(MAKE) -C app init

start-ui:
	+$(MAKE) -C ui start

image:
	docker build --tag ${REPO}/${NAME}:${VERSION} --rm .

image-nocache:
	docker build --tag ${REPO}//${NAME}:${VERSION} --no-cache --rm .

tag:
	docker tag ${REPO}/$(NAME):$(VERSION) ${REPO}/$(NAME):$(VERSION)

tag-latest:
	docker tag ${REPO}/$(NAME):$(VERSION) ${REPO}/$(NAME):latest

push:
	docker push ${REPO}/$(NAME):$(VERSION)

push-latest:
	docker push ${REPO}/$(NAME):latest

release-image: image tag tag-latest push push-latest

release: release-image

test:
	+$(MAKE) -C app test
