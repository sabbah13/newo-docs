.PHONY: help dev build serve clean test deploy status install lint validate
.DEFAULT_GOAL := help

# 🎯 Project Configuration
PROJECT_NAME := Newo SuperAgent Documentation
WEBSITE_DIR := website
NODE_VERSION := 18
NETLIFY_SITE_NAME := # Set this if you have a specific site name

# 📋 Help - Display available commands
help: ## Show this help message
	@echo "🚀 $(PROJECT_NAME)"
	@echo ""
	@echo "📚 Development Commands:"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ && /## Development/ {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "🏗️  Build & Test Commands:"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ && /## Build/ {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "🚀 Deployment Commands:"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ && /## Deploy/ {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "🔧 Utility Commands:"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ && /## Utility/ {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# 📚 Development Commands
install: ## Development - Install dependencies
	@echo "📦 Installing dependencies..."
	@cd $(WEBSITE_DIR) && npm install
	@echo "✅ Dependencies installed!"

dev: install ## Development - Start development server (localhost:3000)
	@echo "🚀 Starting development server..."
	@echo "📱 Open: http://localhost:3000"
	@cd $(WEBSITE_DIR) && npm start

dev-alt: install ## Development - Start development server on port 3030
	@echo "🚀 Starting development server on port 3030..."
	@echo "📱 Open: http://localhost:3030"
	@cd $(WEBSITE_DIR) && npm run start:3030

# 🏗️ Build & Test Commands
build: install ## Build - Build production site
	@echo "🏗️ Building documentation..."
	@cd $(WEBSITE_DIR) && npm run build
	@echo "✅ Build completed! Output: $(WEBSITE_DIR)/build/"

serve: build ## Build - Serve built documentation locally
	@echo "🌐 Serving built documentation..."
	@echo "📱 Open: http://localhost:3000"
	@cd $(WEBSITE_DIR) && npm run serve

clean: ## Build - Clean build artifacts and cache
	@echo "🧹 Cleaning build artifacts..."
	@cd $(WEBSITE_DIR) && npm run clear
	@rm -rf $(WEBSITE_DIR)/build $(WEBSITE_DIR)/.docusaurus
	@echo "✅ Clean completed!"

test: build ## Build - Test the built documentation
	@echo "🧪 Testing build..."
	@if [ -d $(WEBSITE_DIR)/build ]; then \
		echo "✅ Build successful!"; \
		echo "📊 Build size: $$(du -sh $(WEBSITE_DIR)/build 2>/dev/null || echo 'Unknown')"; \
		echo "📄 Files: $$(find $(WEBSITE_DIR)/build -type f | wc -l) files"; \
	else \
		echo "❌ Build failed!"; \
		exit 1; \
	fi

# 🚀 Deployment Commands
build-prod: ## Deploy - Production build with npm ci
	@echo "🏭 Building for production..."
	@cd $(WEBSITE_DIR) && npm ci && npm run build
	@echo "✅ Production build completed!"
	@echo "📁 Output: $(WEBSITE_DIR)/build/"

deploy-preview: build-prod ## Deploy - Create Netlify preview deployment
	@echo "👀 Creating deployment preview..."
	@cd $(WEBSITE_DIR) && \
	if command -v netlify >/dev/null 2>&1; then \
		echo "🚀 Deploying to Netlify preview..."; \
		netlify deploy --dir=build --json | tee deploy-output.json; \
		echo ""; \
		echo "✅ Preview deployment completed!"; \
		echo "🔗 Preview URL: $$(cat deploy-output.json | grep 'deploy_url' | cut -d'"' -f4)"; \
		rm -f deploy-output.json; \
	else \
		echo "❌ Netlify CLI not found!"; \
		echo "📥 Install: npm install -g netlify-cli"; \
		echo "🔐 Login: netlify login"; \
		exit 1; \
	fi

deploy-prod: build-prod ## Deploy - Deploy to Netlify production
	@echo "🚀 Deploying to production..."
	@cd $(WEBSITE_DIR) && \
	if command -v netlify >/dev/null 2>&1; then \
		echo "🚀 Deploying to Netlify production..."; \
		netlify deploy --prod --dir=build --json | tee deploy-output.json; \
		echo ""; \
		echo "✅ Production deployment completed!"; \
		echo "🌐 Production URL: $$(cat deploy-output.json | grep 'url' | head -1 | cut -d'"' -f4)"; \
		rm -f deploy-output.json; \
	else \
		echo "❌ Netlify CLI not found!"; \
		echo "📥 Install: npm install -g netlify-cli"; \
		echo "🔐 Login: netlify login"; \
		exit 1; \
	fi

# 🔧 Utility Commands
status: ## Utility - Show project status
	@echo "📊 $(PROJECT_NAME) Status"
	@echo ""
	@echo "🔧 Environment:"
	@echo "  Node.js: $$(node --version 2>/dev/null || echo '❌ Not installed')"
	@echo "  npm: $$(npm --version 2>/dev/null || echo '❌ Not installed')"
	@echo "  Netlify CLI: $$(netlify --version 2>/dev/null || echo '❌ Not installed')"
	@echo ""
	@echo "📁 Project Structure:"
	@echo "  Documentation files: $$(find $(WEBSITE_DIR)/docs -name '*.md' 2>/dev/null | wc -l || echo '0') files"
	@echo "  Dependencies: $$([ -d $(WEBSITE_DIR)/node_modules ] && echo '✅ Installed' || echo '❌ Missing')"
	@echo ""
	@echo "🏗️ Build Status:"
	@if [ -d $(WEBSITE_DIR)/build ]; then \
		echo "  Build: ✅ Available ($$(du -sh $(WEBSITE_DIR)/build | cut -f1))"; \
	else \
		echo "  Build: ❌ Not built (run 'make build')"; \
	fi
	@echo ""
	@echo "🌐 Deployment:"
	@if command -v netlify >/dev/null 2>&1; then \
		echo "  Netlify CLI: ✅ Available"; \
		cd $(WEBSITE_DIR) && netlify sites:list 2>/dev/null | head -5 || echo "  No sites configured"; \
	else \
		echo "  Netlify CLI: ❌ Not installed"; \
	fi

validate: ## Utility - Validate documentation structure
	@echo "🔍 Validating documentation..."
	@echo "📊 Statistics:"
	@echo "  Markdown files: $$(find $(WEBSITE_DIR)/docs -name '*.md' 2>/dev/null | wc -l) files"
	@echo "  Static assets: $$(find $(WEBSITE_DIR)/static -type f 2>/dev/null | wc -l) files"
	@echo "  Config files: $$(find $(WEBSITE_DIR) -maxdepth 1 -name '*.config.js' | wc -l) files"
	@if [ -f $(WEBSITE_DIR)/docusaurus.config.js ]; then \
		echo "  ✅ Docusaurus config found"; \
	else \
		echo "  ❌ Docusaurus config missing"; \
	fi
	@if [ -f $(WEBSITE_DIR)/sidebars.js ]; then \
		echo "  ✅ Sidebars config found"; \
	else \
		echo "  ❌ Sidebars config missing"; \
	fi

lint: ## Utility - Lint documentation files
	@echo "🔍 Linting documentation..."
	@if command -v markdownlint >/dev/null 2>&1; then \
		markdownlint $(WEBSITE_DIR)/docs/**/*.md && echo "✅ Markdown linting passed!"; \
	else \
		echo "ℹ️  markdownlint not installed (optional)"; \
		echo "📥 Install: npm install -g markdownlint-cli"; \
	fi

# 🎯 Quick Workflows
quick-dev: clean dev ## Quick workflow - Clean and start development
quick-build: clean build serve ## Quick workflow - Clean, build, and serve
quick-deploy: clean deploy-preview ## Quick workflow - Clean and deploy preview

# 🔧 Setup Commands  
setup-netlify: ## Setup - Initialize Netlify deployment
	@echo "🔧 Setting up Netlify deployment..."
	@if ! command -v netlify >/dev/null 2>&1; then \
		echo "📥 Installing Netlify CLI..."; \
		npm install -g netlify-cli; \
	fi
	@echo "🔐 Please run 'netlify login' to authenticate"
	@echo "🌐 Then run 'netlify init' to connect your site"
	@echo "ℹ️  Or use 'netlify sites:create' to create a new site"

setup-project: install ## Setup - Complete project setup
	@echo "🔧 Setting up project..."
	@make validate
	@echo ""
	@echo "✅ Project setup complete!"
	@echo "🚀 Next steps:"
	@echo "  1. Run 'make dev' to start development"
	@echo "  2. Edit files in $(WEBSITE_DIR)/docs/"
	@echo "  3. Run 'make deploy-preview' to test deployment"
	@echo "  4. Run 'make deploy-prod' for production"