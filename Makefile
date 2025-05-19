# Makefile for Pokédex project

.PHONY: test coverage

test:
	pytest -v pokedex/tests/

coverage:
	coverage run -m pytest pokedex/tests/ && coverage report -m
