.PHONY: help install run build

BLUE := \033[36m
BOLD := \033[1m
YELLOW := \033[33m
RESET := \033[0m

help:
	@printf '%bTargets:%b\n' "$(BOLD)" "$(RESET)"
	@printf '  %bmake install%b   %bInstall npm dependencies%b\n' "$(BLUE)" "$(RESET)" "$(YELLOW)" "$(RESET)"
	@printf '  %bmake run%b       %bStart the development server%b\n' "$(BLUE)" "$(RESET)" "$(YELLOW)" "$(RESET)"
	@printf '  %bmake build%b     %bGenerate the static site%b\n' "$(BLUE)" "$(RESET)" "$(YELLOW)" "$(RESET)"
	@printf '  %bmake help%b      %bShow this help text%b\n' "$(BLUE)" "$(RESET)" "$(YELLOW)" "$(RESET)"

install:
	npm install

run:
	npm run dev

build:
	npm run build
