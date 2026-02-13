PYTHON ?= python3
VENV ?= .venv
VENV_PYTHON := $(VENV)/bin/python
VENV_PIP := $(VENV)/bin/pip

.PHONY: venv test test-copy test-quality

venv:
	$(PYTHON) -m venv $(VENV)
	$(VENV_PIP) install -r requirements-dev.txt

test:
	$(VENV_PYTHON) -m pytest -q

test-copy:
	$(PYTHON) tests/check_copy_inventory.py

test-quality:
	$(PYTHON) tests/check_copy_inventory.py
	$(PYTHON) tests/check_uix_budget.py
	$(PYTHON) tests/check_dom_wiring.py
	$(PYTHON) tests/check_lang_duplicates.py
	$(PYTHON) tests/check_lang_schema.py
	$(PYTHON) tests/check_lang_codes.py
