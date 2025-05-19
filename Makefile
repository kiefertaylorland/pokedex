# Makefile for Pokédex project

.PHONY: test coverage

test:
	pytest -v tests/

coverage:
	coverage run -m pytest tests/ && coverage report -m
