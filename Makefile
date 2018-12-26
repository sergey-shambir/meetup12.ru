
.PHONY: all
all: build

.PHONY: build
build:
	docker build -t sshambir/meetup12ru:master .

.PHONY: run
up: build
	docker-compose up -d

.PHONY: stop
down:
	docker-compose down

.PHONY: push
push: build
	docker push sshambir/meetup12ru:master
