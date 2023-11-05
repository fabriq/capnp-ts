MAKEFLAGS += --warn-undefined-variables
SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := build
.DELETE_ON_ERROR:
.SUFFIXES:

capnpc := $(shell which capnpc)
capnp_deps := $(shell find . -name '*.ts' -print)
capnp_in := $(shell find . -name '*.capnp' -print)
capnp_out := $(patsubst %.capnp,%.capnp.ts,$(capnp_in))

%.capnp.ts: $(capnp_deps)
%.capnp.ts: %.capnp
	$(capnpc) -o ./capnpc-ts -I ./lib/std $<	

.PHONY: build
build: $(capnp_out)

.PHONY: clean
clean:
	@rm -f $(capnp_out)
