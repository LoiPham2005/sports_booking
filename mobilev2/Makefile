# ═════════════════════════════════════════════════════════════════
# 📁 Makefile — flutter_base2 Automation (Bash/Zsh — Mac/Linux)
# ═════════════════════════════════════════════════════════════════

.PHONY: help \
        get clean upgrade \
        gen watch l10n full-gen gen-flavor gen-assets gen-icons gen-splash \
        analyze format fix \
        test cov \
        run-dev run-stg run-prod \
        apk-dev apk-stg apk-prod aab-prod \
        feature-full feature-lean \
        rename-package rename-app rename-bundle-id

# ─── HELP ─────────────────────────────────────────────────────────
help:
	@echo "🚀 flutter_base2 — Makefile"
	@echo "═══════════════════════════════════════════════════════════"
	@echo "📦 DEPENDENCIES"
	@echo "  make get                        Install dependencies"
	@echo "  make clean                      Clean build files"
	@echo "  make upgrade                    Upgrade major versions"
	@echo ""
	@echo "⚡ CODE GENERATION"
	@echo "  make gen                        build_runner build"
	@echo "  make watch                      build_runner watch"
	@echo "  make l10n                       Generate localizations"
	@echo "  make l10n-sync                  Sync ARB keys (copy missing from en)"
	@echo "  make l10n-sync-translate        Sync + auto-translate (Google) + gen-l10n"
	@echo "  make full-gen                   Clean + get + l10n + gen"
	@echo "  make gen-flavor                 Run flutter_flavorizr"
	@echo "  make gen-icons                  Generate launcher icons"
	@echo "  make gen-splash                 Generate native splash"
	@echo ""
	@echo "🔧 QUALITY"
	@echo "  make analyze                    flutter analyze"
	@echo "  make format                     dart format ."
	@echo "  make fix                        dart fix --apply"
	@echo ""
	@echo "🧪 TESTING"
	@echo "  make test                       Run all tests"
	@echo "  make cov                        Test + coverage HTML"
	@echo ""
	@echo "🧑‍💻 RUN (per flavor)"
	@echo "  make run-dev | run-stg | run-prod"
	@echo ""
	@echo "📦 BUILD"
	@echo "  make apk-dev | apk-stg | apk-prod"
	@echo "  make aab-prod"
	@echo ""
	@echo "🧱 SCAFFOLD"
	@echo "  make feature-full   name=foo    Full feature (Clean Architecture)"
	@echo "  make feature-lean   name=foo    Lean feature (no Domain layer)"
	@echo ""
	@echo "🛠️  RENAME"
	@echo "  make rename-package name=new_pkg"
	@echo "  make rename-app     name=\"App Name\""
	@echo "  make rename-bundle-id name=com.x.y"

# ─── DEPENDENCIES ─────────────────────────────────────────────────
get:
	fvm flutter pub get

clean:
	fvm flutter clean

upgrade:
	fvm flutter pub upgrade --major-versions

# ─── CODE GENERATION ──────────────────────────────────────────────
gen:
	fvm dart run build_runner build --delete-conflicting-outputs

watch:
	fvm dart run build_runner watch --delete-conflicting-outputs

l10n:
	fvm flutter gen-l10n

l10n-sync:
	fvm dart run tools/l10n_sync.dart

l10n-sync-translate:
	fvm dart run tools/l10n_sync.dart --translate && fvm flutter gen-l10n

full-gen:
	fvm flutter clean
	fvm flutter pub get
	fvm flutter gen-l10n
	fvm dart run build_runner build --delete-conflicting-outputs

gen-flavor:
	fvm flutter pub run flutter_flavorizr

gen-assets:
	fvm dart run build_runner build --delete-conflicting-outputs

gen-icons:
	fvm flutter pub run flutter_launcher_icons

gen-splash:
	fvm flutter pub run flutter_native_splash:create

# ─── QUALITY ──────────────────────────────────────────────────────
analyze:
	fvm flutter analyze

format:
	fvm dart format .

fix:
	fvm dart fix --apply

# ─── TESTING ──────────────────────────────────────────────────────
test:
	fvm flutter test

cov:
	fvm flutter test --coverage
	@which genhtml > /dev/null && genhtml coverage/lcov.info -o coverage/html || echo "⚠️  Install lcov: brew install lcov"

# ─── RUN ──────────────────────────────────────────────────────────
run-dev:
	fvm flutter run --flavor dev -t lib/main_dev.dart

run-stg:
	fvm flutter run --flavor stg -t lib/main_stg.dart

run-prod:
	fvm flutter run --flavor prod -t lib/main_prod.dart

# ─── BUILD ────────────────────────────────────────────────────────
apk-dev:
	fvm flutter build apk --flavor dev -t lib/main_dev.dart --release

apk-stg:
	fvm flutter build apk --flavor stg -t lib/main_stg.dart --release

apk-prod:
	fvm flutter build apk --flavor prod -t lib/main_prod.dart --release

aab-prod:
	fvm flutter build appbundle --flavor prod -t lib/main_prod.dart --release

# ─── SCAFFOLD (Mason) ─────────────────────────────────────────────
feature-full:
	@test -n "$(name)" || (echo "❌ Usage: make feature-full name=foo" && exit 1)
	mason make feature_full --name $(name) --on-conflict overwrite

feature-lean:
	@test -n "$(name)" || (echo "❌ Usage: make feature-lean name=foo" && exit 1)
	mason make feature_lean --name $(name) --on-conflict overwrite

# ─── RENAME ───────────────────────────────────────────────────────
rename-package:
	@test -n "$(name)" || (echo "❌ Usage: make rename-package name=new_pkg" && exit 1)
	@OLD=$$(grep -m1 '^name: ' pubspec.yaml | awk '{print $$2}'); \
	echo "🔄 Renaming package $$OLD → $(name)"; \
	sed -i '' "s/^name: $$OLD/name: $(name)/" pubspec.yaml; \
	find lib test -name '*.dart' -exec sed -i '' "s|package:$$OLD|package:$(name)|g" {} +; \
	fvm flutter clean && fvm flutter pub get

rename-app:
	@test -n "$(name)" || (echo "❌ Usage: make rename-app name=\"App Name\"" && exit 1)
	fvm flutter pub run rename setAppName --value "$(name)"

rename-bundle-id:
	@test -n "$(name)" || (echo "❌ Usage: make rename-bundle-id name=com.x.y" && exit 1)
	fvm dart run rename setBundleId --targets android,ios --value "$(name)"
