PROJECT       := mathreview
TAGLINE       := math review worksheets, built in Docker
HELP_VARS      = CONFIRM=$(CONFIRM)
HELP_EXAMPLE   = make pdf

# ─── Preamble ────────────────────────────────────────────────────────────────
# -e stops a recipe at the first failing command; -o pipefail stops a gate that
# pipes through a filter from reporting the filter's exit code instead of the
# command's — without it, a suite that fails into `tail` "passes".
SHELL         := /usr/bin/env bash
.SHELLFLAGS   := -eo pipefail -c
.DEFAULT_GOAL := help
MAKEFLAGS     += --no-print-directory

# ─── Colour ──────────────────────────────────────────────────────────────────
# MAKE_TERMOUT (GNU Make >= 4.1) is set only when stdout is a terminal, and is
# the only reliable test available here: `test -t 1` inside $(shell ...) always
# reports false, because make captures that command's stdout through a pipe.
# So `make help | less` and CI logs stay clean. NO_COLOR disables, FORCE_COLOR
# overrides both.
COLOR ?= $(if $(MAKE_TERMOUT),1,0)
ifdef NO_COLOR
  COLOR := 0
endif
ifdef FORCE_COLOR
  COLOR := 1
endif
ifeq ($(COLOR),1)
  # Real ESC bytes, so a plain `echo` renders them without needing -e.
  C_HEAD := $(shell printf '\033[1m')
  C_CMD  := $(shell printf '\033[36m')
  C_OK   := $(shell printf '\033[32m')
  C_WARN := $(shell printf '\033[33m')
  C_ERR  := $(shell printf '\033[31m')
  C_DIM  := $(shell printf '\033[2m')
  C_OFF  := $(shell printf '\033[0m')
endif

# Explains why a core verb does not apply here, then fails.
NA = @printf '  $(C_ERR)make $@$(C_OFF) does not apply to $(PROJECT).\n  $(C_DIM)%s$(C_OFF)\n\n' $(1) >&2; exit 2

# Width of the target-name column in help; widen it where names are long.
HELP_PAD ?= 18

# PROJECT, TAGLINE, HELP_VARS and HELP_EXAMPLE are interpolated into a
# single-quoted shell string below, so none of them may contain an apostrophe.
##@ General
.PHONY: help
help: ## List the available targets
	@printf '\n  $(C_HEAD)$(PROJECT)$(C_OFF) — $(TAGLINE)\n'
	@printf '  $(C_DIM)usage: make <target>$(C_OFF)\n'
	@awk 'BEGIN { FS = ":.*?## " } \
	  /^##@ / { printf "\n  $(C_HEAD)%s$(C_OFF)\n", substr($$0, 5); next } \
	  /^[a-zA-Z0-9_.-]+:.*?## / { printf "    $(C_CMD)%-$(HELP_PAD)s$(C_OFF) %s\n", $$1, $$2 }' \
	  $(MAKEFILE_LIST)
	@printf '\n  $(C_DIM)Variables:$(C_OFF) $(HELP_VARS)\n'
	@printf '  $(C_DIM)Example:$(C_OFF)   $(HELP_EXAMPLE)\n\n'

# ─── End of the shared block ─────────────────────────────────────────────────

CONFIRM ?=

##@ Setup
.PHONY: install
install: ## Install the Node dependencies (npm ci)
	npm ci

.PHONY: setup
setup: install ## First run on a fresh clone

##@ Development
.PHONY: dev
dev: ## Dev server in Docker (compose service: dev)
	docker compose up dev

.PHONY: build
build: ## Build the app image
	docker compose build app

.PHONY: run
run: ## Serve the built app (compose service: app)
	docker compose up app

.PHONY: stop
stop: ## Stop the stack
	docker compose down

##@ Output
.PHONY: pdf
pdf: ## Build the PDFs into output/, owned by you and not root
	docker compose build pdf
	docker compose run --rm pdf
	docker run --rm -v $(PWD)/output:/output alpine chown -R $(shell id -u):$(shell id -g) /output

##@ Gates
.PHONY: test
test: ## Not applicable here
	$(call NA,'There is no test suite in this repo yet.')

.PHONY: check
check: ## Not applicable here
	$(call NA,'There is nothing to gate yet: no tests, no linter. Use make build.')

.PHONY: verify
verify: build ## Full gate: a clean image build is the only check there is

.PHONY: fmt
fmt: ## Not applicable here
	$(call NA,'No formatter is configured for this repo.')

##@ Cleaning
# `clean` used to remove images and volumes too. Under the standard `clean` is
# always safe to run, so that part moved to `distclean`, behind a confirmation.
.PHONY: clean
clean: ## Remove build output (dist/ and output/)
	rm -rf dist
	docker run --rm -v $(PWD)/output:/output alpine rm -rf /output/*
	rm -rf output

.PHONY: distclean
distclean: ## DESTROYS the local images and volumes. Requires CONFIRM=yes
	@if [ "$(CONFIRM)" != "yes" ]; then \
		printf '  $(C_WARN)This removes the compose volumes and locally built images.$(C_OFF)\n'; \
		printf '  Re-run with: make distclean CONFIRM=yes\n\n'; \
		exit 1; \
	fi
	$(MAKE) clean
	docker compose down --rmi local --volumes

# ─── Compatibility aliases ───────────────────────────────────────────────────
# Kept because the README still uses these names.
.PHONY: up
up: run
