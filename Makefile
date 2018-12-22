
.PHONY: all
all: build

.PHONY: build
build:
	docker build -t sshambir/meetup12ru:master .

.PHONY: run
run: build
	docker run -it --rm -p 80:3000 sshambir/meetup12ru:master

.PHONY: push
push: build
	docker push sshambir/meetup12ru:master
