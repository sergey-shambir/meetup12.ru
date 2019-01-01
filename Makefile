
.PHONY: all
all: build

.PHONY: build
build:
	docker build -t sshambir/meetup12ru:master .

.PHONY: run
up: build
	mkdir -m 777 -p $(PWD)/data/postgres_files
	USER_WITH_GROUP="$(shell id -u):$(shell id -g)" docker-compose up -d

.PHONY: stop
down:
	docker-compose down

.PHONY: push
push: build
	docker push sshambir/meetup12ru:master
