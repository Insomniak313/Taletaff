SHELL := /bin/bash
PROJECT := taletaff
DOCKER := docker compose

.PHONY: install dev lint test typecheck docker-build docker-up docker-down docker-logs

install:
	npm install

dev:
	npm run dev

lint:
	npm run lint

test:
	npm run test

typecheck:
	npm run typecheck

docker-build:
	$(DOCKER) build web

docker-up:
	$(DOCKER) up web

docker-down:
	$(DOCKER) down

docker-logs:
	$(DOCKER) logs -f web
