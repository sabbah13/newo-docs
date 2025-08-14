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

### Development
```bash
# Install dependencies
cd website && npm install

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

### Makefile Automation
```bash
# Development workflows
make dev                    # Start development server
make build                  # Build production site
make serve                  # Serve built documentation
make clean                  # Clean build artifacts

# Testing and validation
make test-build            # Complete build test
make validate-docs         # Structure validation
make lint                  # Markdown linting (if markdownlint installed)

# Deployment
make build-production      # Production build with npm ci
make deploy-netlify        # Deploy to Netlify (if CLI installed)
make deploy-preview        # Create Netlify preview deployment

# Project information
make status                # Show project status and statistics
make info                  # Show system and dependency information
make help                  # Show all available commands
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

### Adding New Documentation
1. Create Markdown files in `website/docs/` or `website/docs/actions/`
2. Update `website/sidebars.js` to include in navigation
3. Use proper YAML frontmatter with `slug`, `sidebar_position`, `title`, `description`
4. Test locally with `npm start`
5. Build and validate with `make test-build`

### Modifying Agent Code
- Agent implementations are reference material only
- Focus on documentation rather than agent modification
- Use agent code to understand system architecture for documentation updates

### Backup and Recovery
- **Automated backups**: Configuration backups created with timestamped filenames
- **Organized storage**: `backups/old-configs/` and `backups/old-docs/` directories
- **Recovery process**: Manual restoration from backup files

## Build and Deployment

### Local Development
- Development server with hot reloading on port 3000 (or 3030)
- Build validation and testing capabilities
- Comprehensive status reporting

### Production Deployment
- **Netlify integration**: Automatic deployment from `website/build/` directory
- **Security headers**: X-Frame-Options, XSS protection, content type validation
- **Performance optimization**: Asset caching, compression, CDN distribution
- **Branch deployments**: Support for preview deployments and branch-specific builds

### Quality Assurance
- **Link validation**: Link checker integration (if installed)
- **Markdown linting**: Markdownlint integration for consistency
- **Build testing**: Complete build process validation
- **Structure validation**: Documentation hierarchy verification

## Key Integrations

- **Mermaid**: Architectural diagram rendering with custom theming
- **Kodemo**: Interactive code examples and tutorials
- **Netlify**: Production deployment and CDN
- **React**: Custom components for enhanced functionality