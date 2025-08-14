# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Newo SuperAgent Documentation Project** - a comprehensive documentation system for the Newo SuperAgent Digital Employee platform. The project uses **Docusaurus 2** to generate modern, interactive documentation from Markdown files.

The codebase contains:
- **Documentation site**: Modern Docusaurus-based documentation (primary focus)
- **Agent implementations**: 9 specialized agents in the `project/` directory with `.guidance` and `.jinja` template files
- **Flow definitions**: Event-driven agent orchestration defined in `flows.yaml`
- **Backup systems**: Organized historical documentation in `backups/`

## Key Commands

### Direct npm Commands (if needed)
```bash
# Navigate to website directory
cd website

# Install dependencies
npm install

# Start development server
npm start                    # Standard port 3000
npm run start:3030          # Alternative port 3030

# Build for production
npm run build

# Serve built documentation
npm run serve
npm run serve:3030          # Alternative port 3030

# Clear build cache
npm run clear
```

### Recommended Makefile Workflow (Clean & Modern)
```bash
# 📚 Development Commands
make dev                    # Install deps + start dev server (localhost:3000)
make dev-alt               # Start dev server on port 3030
make install               # Install dependencies only

# 🏗️ Build & Test Commands  
make build                 # Build production site
make serve                 # Build + serve locally for testing
make test                  # Build + validate output
make clean                 # Clean build artifacts and cache

# 🚀 Deployment Commands
make build-prod           # Production build with npm ci
make deploy-preview       # Deploy preview to Netlify (non-interactive)
make deploy-prod          # Deploy to Netlify production (non-interactive)

# 🔧 Utility Commands
make status               # Show comprehensive project status  
make validate             # Validate documentation structure
make lint                 # Lint markdown files (optional)

# 🎯 Quick Workflows
make quick-dev            # Clean + start development
make quick-build          # Clean + build + serve
make quick-deploy         # Clean + deploy preview

# 🔧 Setup Commands
make setup-netlify        # Install Netlify CLI + setup instructions
make setup-project        # Complete project setup + validation
make help                 # Show all available commands with descriptions
```

## Architecture Overview

### Documentation Architecture
The project follows standard Docusaurus patterns with some customizations:

- **`website/docs/`**: Primary documentation content (Markdown files)
- **`website/docusaurus.config.js`**: Main Docusaurus configuration
- **`website/sidebars.js`**: Navigation structure definition
- **`website/src/`**: Custom React components and pages
- **`website/static/`**: Static assets (images, favicon, etc.)

### Agent System Architecture (Reference Only)
The `project/` directory contains 9 specialized agents implementing the Newo SuperAgent platform:

1. **ConvoAgent**: Main conversational agent with 15+ specialized flows
2. **ApifyCheckAvailabilityWorker**: Availability checking service
3. **GeneralManagerAgent**: Management coordination
4. **MagicWorker**: Task automation worker
5. **MultiLocationAgent**: Multi-location business logic
6. **SmsWorker**: SMS communication handling
7. **SuperAgentProject**: Core platform functionality
8. **TaskManager**: Task orchestration and management
9. **TestAgent**: Testing and validation agent

Each agent contains multiple flows with:
- **`.guidance` files**: LLM prompt templates and instructions
- **`.jinja` files**: Dynamic template generation
- **Flow directories**: Organized by functional area (e.g., `CAMainFlow`, `CAScheduleFlow`)

### Flow System
- **`flows.yaml`**: Event-driven orchestration rules
- **Event-based communication**: Agents communicate via events and commands
- **Skill execution model**: Modular skill-based architecture

## File Structure Patterns

### Documentation Files
- **Root docs**: `website/docs/*.md` - Main documentation pages
- **Actions API**: `website/docs/actions/*.md` - Individual API function documentation
- **Assets**: `website/static/` - Images, icons, and static resources

### Agent Implementation Files
- **Agent flows**: `project/{AgentName}/{FlowName}/` directories
- **Skill files**: `*Skill.guidance` and `*Skill.jinja` patterns
- **Utility functions**: `_utils*Skill.guidance` pattern (private utilities)
- **Schema definitions**: `*Schema*Skill.guidance` pattern

### Configuration Files
- **Docusaurus config**: `website/docusaurus.config.js` - Site configuration
- **Navigation**: `website/sidebars.js` - Comprehensive sidebar with 35+ actions
- **Package management**: `website/package.json` - Dependencies and scripts
- **Deployment**: `netlify.toml` - Netlify deployment configuration

## Important Implementation Details

### Docusaurus Configuration
- **Mermaid integration**: Configured for architectural diagrams with custom theming
- **Route structure**: Documentation served at root path (`/`)
- **Kodemo integration**: Interactive code examples using `@kodemo/player`
- **Custom styling**: Material Design-inspired theme in blue palette

### Navigation Structure
The sidebar includes:
- **Core Platform** section with architecture and analysis
- **Event & Flow System** with execution details
- **Development & Integration** guides
- **Reference & API** with comprehensive actions documentation
- **Business & Operations** with troubleshooting and setup

### Build Process
- **Production builds**: Use `npm ci` for consistent dependency installation
- **Build output**: `website/build/` directory
- **Deployment**: Configured for Netlify with security headers and caching
- **Asset optimization**: Static assets cached for 1 year

### Content Management
- **Markdown files**: Standard Markdown with YAML frontmatter
- **Cross-references**: Extensive internal linking between docs
- **Visual diagrams**: Mermaid diagrams for system architecture
- **Interactive examples**: Kodemo integration for code walkthroughs

## Development Workflow

### Quick Start (Recommended)
1. **Setup**: `make setup-project` - Complete project setup with validation
2. **Develop**: `make dev` - Start development server with hot reloading  
3. **Test**: `make test` - Build and validate before deployment
4. **Deploy Preview**: `make deploy-preview` - Test deployment on Netlify
5. **Production**: `make deploy-prod` - Deploy to production when ready

### Local Development Process
1. **Start Development**: 
   ```bash
   make dev                 # Installs deps + starts server on localhost:3000
   # OR
   make dev-alt            # Alternative port 3030
   ```

2. **Edit Documentation**:
   - Create/edit Markdown files in `website/docs/` or `website/docs/actions/`
   - Update `website/sidebars.js` for navigation changes
   - Use proper YAML frontmatter: `slug`, `sidebar_position`, `title`, `description`
   - Changes auto-reload in browser during development

3. **Test Locally**:
   ```bash
   make test               # Build + validate output
   make serve              # Build + serve for final testing
   ```

### Deployment Process
1. **Preview Deployment**: `make deploy-preview` - Non-interactive Netlify preview with URL display
2. **Production Deployment**: `make deploy-prod` - Non-interactive Netlify production with URL display
3. **Status Check**: `make status` - Verify deployment status and site info

### Live Site
- **Production**: https://newo-docs-new.netlify.app
- **Preview Testing**: Each preview gets unique URL shown after deployment

### Working with Agent Code (Reference Only)
- Agent implementations in `project/` directory are **reference material**
- Focus on **documentation** rather than agent modification
- Use agent code to understand system architecture for documentation updates
- All agent-related content should be documented, not modified

### Project Management
- **Status Monitoring**: `make status` - Comprehensive project status
- **Structure Validation**: `make validate` - Check documentation structure
- **Cleanup**: `make clean` - Clean build artifacts and cache
- **Troubleshooting**: Check Node.js/npm versions, Netlify CLI setup

## Build and Deployment

### Local Development Environment
- **Development Server**: Hot reloading on port 3000 (default) or 3030 (alternative)
- **Auto-Installation**: Dependencies automatically installed via `make dev`
- **Build Validation**: Integrated testing with `make test`
- **Status Monitoring**: Comprehensive reporting with `make status`

### Deployment Pipeline
- **Non-Interactive**: All deployment commands work without user prompts
- **Production Build**: Uses `npm ci` for consistent dependency installation
- **Netlify Integration**: Direct deployment via CLI in non-interactive mode
- **Preview Testing**: `make deploy-preview` for testing before production
- **Status Verification**: Built-in deployment status checking

### Production Deployment Process
1. **Automated Build**: `make build-prod` - Production build with npm ci
2. **Preview First**: `make deploy-preview` - Test deployment and get preview URL
3. **Production Deploy**: `make deploy-prod` - Deploy to production when ready
4. **Status Check**: `make status` - Verify deployment and site configuration

### Quality Assurance & Validation
- **Build Testing**: Automatic validation with file count and size reporting
- **Structure Validation**: Documentation hierarchy and config file checking
- **Lint Integration**: Optional markdown linting with markdownlint-cli
- **Dependency Verification**: Node.js, npm, and Netlify CLI status checking

### Netlify Configuration
- **Security Headers**: X-Frame-Options, XSS protection, content type validation
- **Performance Optimization**: Asset caching (1 year), compression, CDN distribution
- **Build Settings**: Configured for `website/build/` output directory
- **Branch Deployments**: Support for preview deployments and branch-specific builds
- **Node.js Version**: Pinned to Node.js 18 for consistency

## Setup Instructions

### First Time Setup
1. **Install Prerequisites**:
   ```bash
   # Ensure Node.js 18+ and npm are installed
   node --version  # Should show v18.x.x or higher
   npm --version   # Should show 9.x.x or higher
   ```

2. **Project Setup**:
   ```bash
   make setup-project    # Complete setup with validation
   ```

3. **Netlify Setup** (for deployment):
   ```bash
   make setup-netlify    # Install CLI and get setup instructions
   netlify login         # Authenticate with Netlify
   netlify init          # Connect to existing site
   # OR
   netlify sites:create  # Create new site
   ```

### Daily Development Workflow
```bash
# Start development (most common)
make dev                  # Install deps + dev server on localhost:3000

# Test your changes
make test                 # Build + validate

# Deploy for testing
make deploy-preview       # Get preview URL to share

# Deploy to production (when ready)
make deploy-prod         # Deploy to production
```

### Troubleshooting
- **Dependencies**: Run `make install` if there are package issues
- **Build Issues**: Run `make clean` then rebuild
- **Netlify Issues**: Check `make status` for CLI setup
- **Port Conflicts**: Use `make dev-alt` for port 3030

## Key Integrations

- **Docusaurus 3.8+**: Modern documentation framework with React
- **Mermaid**: Architectural diagram rendering with custom theming
- **Kodemo**: Interactive code examples and tutorials
- **Netlify**: Production deployment and CDN with security headers
- **Node.js 18**: Long-term support version for stability