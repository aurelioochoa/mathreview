.PHONY: install dev build up pdf clean stop

install:
	npm ci

dev:
	docker compose up dev

build:
	docker compose build app

up:
	docker compose up app

pdf:
	docker compose build pdf
	docker compose run --rm pdf
	docker run --rm -v $(PWD)/output:/output alpine chown -R $(shell id -u):$(shell id -g) /output

stop:
	docker compose down

clean:
	rm -rf dist
	docker run --rm -v $(PWD)/output:/output alpine rm -rf /output/*
	rm -rf output
	docker compose down --rmi local --volumes
