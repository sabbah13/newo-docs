.PHONY: help install dev build serve clean deploy backup restore status switch-docs update-merged

# Default target
help:
	@echo "🚀 Newo SuperAgent Documentation Management"
	@echo ""
	@echo "📚 Documentation Commands:"
	@echo "  make install       Install dependencies"
	@echo "  make dev          Start development server"
	@echo "  make dev-new      Start development server with new docs"
	@echo "  make build        Build production documentation"
	@echo "  make build-new    Build production with new documentation"
	@echo "  make serve        Serve built documentation"
	@echo "  make clean        Clean build artifacts"
	@echo ""
	@echo "🔄 Documentation Management:"
	@echo "  make switch-new   Switch to new comprehensive documentation"
	@echo "  make switch-old   Switch back to original documentation"
	@echo "  make backup       Backup current configuration"
	@echo "  make restore      Restore from backup"
	@echo "  make status       Show current documentation status"
	@echo ""
	@echo "📝 Content Management:"
	@echo "  make update-merged  Update merged docs from latest changes"
	@echo "  make sync-assets    Sync assets and static files"
	@echo "  make validate-docs  Validate documentation structure"
	@echo ""
	@echo "🚀 Deployment:"
	@echo "  make deploy       Deploy to production"
	@echo "  make deploy-test  Deploy to test environment"

# Variables
WEBSITE_DIR := website
DOCS_DIR := docs
MERGED_DIR := $(DOCS_DIR)/merged
NEW_DOCS_DIR := $(WEBSITE_DIR)/docs-new
NODE_MODULES := $(WEBSITE_DIR)/node_modules
PACKAGE_JSON := $(WEBSITE_DIR)/package.json

# Install dependencies
install: $(NODE_MODULES)

$(NODE_MODULES): $(PACKAGE_JSON)
	@echo "📦 Installing dependencies..."
	cd $(WEBSITE_DIR) && npm install
	@echo "✅ Dependencies installed!"

# Development servers
dev: install
	@echo "🚀 Starting development server with original docs..."
	cd $(WEBSITE_DIR) && npm run start

dev-new: install switch-new
	@echo "🚀 Starting development server with new comprehensive docs..."
	cd $(WEBSITE_DIR) && npm run start

dev-port: install
	@echo "🚀 Starting development server on port 3030..."
	cd $(WEBSITE_DIR) && npm run start:3030

# Build commands
build: install
	@echo "🏗️ Building documentation..."
	cd $(WEBSITE_DIR) && npm run build
	@echo "✅ Build completed!"

build-new: install switch-new
	@echo "🏗️ Building new comprehensive documentation..."
	cd $(WEBSITE_DIR) && npm run build
	@echo "✅ New documentation build completed!"

# Serve built documentation
serve: build
	@echo "🌐 Serving built documentation..."
	cd $(WEBSITE_DIR) && npm run serve

serve-new: build-new
	@echo "🌐 Serving new built documentation..."
	cd $(WEBSITE_DIR) && npm run serve

serve-port: build
	@echo "🌐 Serving documentation on port 3030..."
	cd $(WEBSITE_DIR) && npm run serve:3030

# Production deployment commands
build-production: switch-new
	@echo "🏭 Building for production deployment..."
	cd $(WEBSITE_DIR) && npm ci && npm run build
	@echo "✅ Production build completed!"
	@echo "📁 Build output: build/"

deploy-netlify: build-production
	@echo "🚀 Deploying to Netlify..."
	@if command -v netlify >/dev/null 2>&1; then \
		netlify deploy --prod --dir=build; \
		echo "✅ Deployed to Netlify!"; \
	else \
		echo "⚠️  Netlify CLI not installed. Install with: npm install -g netlify-cli"; \
		echo "📖 Manual deployment: Upload build/ folder to Netlify"; \
	fi

deploy-preview: build-production
	@echo "👀 Creating Netlify deploy preview..."
	@if command -v netlify >/dev/null 2>&1; then \
		netlify deploy --dir=build; \
		echo "✅ Deploy preview created!"; \
	else \
		echo "⚠️  Netlify CLI not installed. Install with: npm install -g netlify-cli"; \
	fi

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	cd $(WEBSITE_DIR) && npm run clear
	rm -rf $(WEBSITE_DIR)/build
	rm -rf $(WEBSITE_DIR)/.docusaurus
	@echo "✅ Clean completed!"

# Documentation management
switch-new: backup
	@echo "🔄 Switching to new comprehensive documentation..."
	@if [ -f $(WEBSITE_DIR)/docusaurus.config.js ]; then \
		mv $(WEBSITE_DIR)/docusaurus.config.js $(WEBSITE_DIR)/docusaurus.config.js.backup; \
	fi
	@if [ -f $(WEBSITE_DIR)/sidebars.js ]; then \
		mv $(WEBSITE_DIR)/sidebars.js $(WEBSITE_DIR)/sidebars.js.backup; \
	fi
	cp $(WEBSITE_DIR)/docusaurus-new.config.js $(WEBSITE_DIR)/docusaurus.config.js
	cp $(WEBSITE_DIR)/sidebars-new.js $(WEBSITE_DIR)/sidebars.js
	@echo "✅ Switched to new comprehensive documentation!"
	@echo "🔍 Run 'make status' to verify the switch"
	@echo "ℹ️  Documentation available at http://localhost:3000/docs"

switch-old: 
	@echo "🔄 Switching back to original documentation..."
	@if [ -f $(WEBSITE_DIR)/docusaurus.config.js.backup ]; then \
		mv $(WEBSITE_DIR)/docusaurus.config.js.backup $(WEBSITE_DIR)/docusaurus.config.js; \
	fi
	@if [ -f $(WEBSITE_DIR)/sidebars.js.backup ]; then \
		mv $(WEBSITE_DIR)/sidebars.js.backup $(WEBSITE_DIR)/sidebars.js; \
	fi
	@echo "✅ Switched back to original documentation!"
	@echo "🔍 Run 'make status' to verify the switch"

backup:
	@echo "💾 Creating backup of current configuration..."
	@mkdir -p backups
	@if [ -f $(WEBSITE_DIR)/docusaurus.config.js ]; then \
		cp $(WEBSITE_DIR)/docusaurus.config.js backups/docusaurus.config.js.$(shell date +%Y%m%d_%H%M%S); \
	fi
	@if [ -f $(WEBSITE_DIR)/sidebars.js ]; then \
		cp $(WEBSITE_DIR)/sidebars.js backups/sidebars.js.$(shell date +%Y%m%d_%H%M%S); \
	fi
	@echo "✅ Backup completed!"

restore:
	@echo "🔄 Available backups:"
	@ls -la backups/ 2>/dev/null || echo "No backups found"
	@echo "To restore, manually copy the desired backup file to $(WEBSITE_DIR)/"

status:
	@echo "📊 Documentation Status:"
	@echo ""
	@echo "📁 Documentation Structure:"
	@if [ -d $(NEW_DOCS_DIR) ]; then \
		echo "  ✅ New documentation available ($(NEW_DOCS_DIR))"; \
		echo "     📄 Files: $$(find $(NEW_DOCS_DIR) -name '*.md' | wc -l) markdown files"; \
	else \
		echo "  ❌ New documentation not found"; \
	fi
	@if [ -d $(WEBSITE_DIR)/docs ]; then \
		echo "  ✅ Original documentation available"; \
		echo "     📄 Files: $$(find $(WEBSITE_DIR)/docs -name '*.md' | wc -l) markdown files"; \
	fi
	@echo ""
	@echo "⚙️ Current Configuration:"
	@if [ -f $(WEBSITE_DIR)/docusaurus.config.js ]; then \
		echo "  📝 Config: $$(head -5 $(WEBSITE_DIR)/docusaurus.config.js | grep -E '(title|docs:)' | head -1 || echo 'Standard config')"; \
	fi
	@if [ -f $(WEBSITE_DIR)/sidebars.js ]; then \
		echo "  📚 Sidebar: $$(wc -l < $(WEBSITE_DIR)/sidebars.js) lines"; \
	fi
	@echo ""
	@echo "🏗️ Build Status:"
	@if [ -d $(WEBSITE_DIR)/build ]; then \
		echo "  ✅ Build directory exists"; \
		echo "     📊 Size: $$(du -sh $(WEBSITE_DIR)/build 2>/dev/null || echo 'Unknown')"; \
	else \
		echo "  ❌ No build directory (run 'make build')"; \
	fi

# Content management
update-merged:
	@echo "📝 Updating merged documentation..."
	@if [ -d $(MERGED_DIR) ]; then \
		echo "✅ Merged docs found, copying to website structure..."; \
		python update_docs_frontmatter.py; \
		echo "✅ Documentation updated!"; \
	else \
		echo "❌ Merged documentation directory not found at $(MERGED_DIR)"; \
	fi

sync-assets:
	@echo "📁 Syncing static assets..."
	@mkdir -p $(WEBSITE_DIR)/static/img
	@if [ -d assets ]; then \
		cp -r assets/* $(WEBSITE_DIR)/static/; \
		echo "✅ Assets synced!"; \
	else \
		echo "ℹ️ No assets directory found"; \
	fi

validate-docs:
	@echo "🔍 Validating documentation structure..."
	@echo "📊 Documentation Statistics:"
	@echo "  New docs: $$(find $(NEW_DOCS_DIR) -name '*.md' 2>/dev/null | wc -l) files"
	@echo "  Merged docs: $$(find $(MERGED_DIR) -name '*.md' 2>/dev/null | wc -l) files"
	@echo "  Original docs: $$(find $(DOCS_DIR) -maxdepth 1 -name '*.md' 2>/dev/null | wc -l) files"
	@echo ""
	@echo "🔗 Checking for broken links..."
	@if command -v linkchecker >/dev/null 2>&1; then \
		echo "Running link checker..."; \
		linkchecker --check-extern $(WEBSITE_DIR)/build/index.html 2>/dev/null || echo "⚠️ Some links may be broken"; \
	else \
		echo "ℹ️ Install linkchecker for link validation"; \
	fi

# Deployment
deploy: build
	@echo "🚀 Deploying to production..."
	cd $(WEBSITE_DIR) && npm run deploy
	@echo "✅ Deployment completed!"

deploy-test: build
	@echo "🧪 Deploying to test environment..."
	@echo "ℹ️ Configure your test deployment settings"
	# Add your test deployment commands here

deploy-new: build-new
	@echo "🚀 Deploying new comprehensive documentation..."
	cd $(WEBSITE_DIR) && npm run deploy
	@echo "✅ New documentation deployed!"

# Development utilities
lint:
	@echo "🔍 Linting documentation files..."
	@if command -v markdownlint >/dev/null 2>&1; then \
		markdownlint $(NEW_DOCS_DIR)/*.md; \
		echo "✅ Markdown linting completed!"; \
	else \
		echo "ℹ️ Install markdownlint-cli for markdown linting"; \
	fi

test-build:
	@echo "🧪 Testing build process..."
	make clean
	make build-new
	@if [ -d $(WEBSITE_DIR)/build ]; then \
		echo "✅ Build test successful!"; \
		echo "📊 Build size: $$(du -sh $(WEBSITE_DIR)/build)"; \
	else \
		echo "❌ Build test failed!"; \
		exit 1; \
	fi

# Full workflow commands
full-rebuild: clean install build-new
	@echo "🏗️ Complete rebuild finished!"

full-rebuild-serve: full-rebuild serve-new
	@echo "🌐 Rebuild and serve completed!"

# Info commands
info:
	@echo "ℹ️ System Information:"
	@echo "  Node.js: $$(node --version 2>/dev/null || echo 'Not installed')"
	@echo "  npm: $$(npm --version 2>/dev/null || echo 'Not installed')"
	@echo "  Docusaurus: $$(cd $(WEBSITE_DIR) && npm list @docusaurus/core --depth=0 2>/dev/null | grep @docusaurus || echo 'Not installed')"
	@echo "  Documentation files: $$(find . -name '*.md' | wc -l)"
	@echo "  Project size: $$(du -sh . 2>/dev/null || echo 'Unknown')"