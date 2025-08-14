# Newo SuperAgent Documentation

[![Netlify Status](https://api.netlify.com/api/v1/badges/0261a17b-0fd0-45c9-a486-a0547eed90cb/deploy-status)](https://app.netlify.com/sites/newo-docs-new/deploys)

**🌐 Live Site**: [https://newo-docs-new.netlify.app](https://newo-docs-new.netlify.app)

Modern documentation site for the Newo SuperAgent Digital Employee platform, built with Docusaurus 3.

## 🚀 Quick Start

```bash
# Complete setup
make setup-project

# Start development server
make dev

# Open http://localhost:3000 and start editing!
```

## 📚 Development Workflow

### Daily Development
```bash
make dev              # Start development server
make test             # Build and validate changes
make deploy-preview   # Deploy preview to test
make deploy-prod      # Deploy to production
```

### Available Commands
- `make help` - Show all available commands
- `make status` - Check project status
- `make validate` - Validate documentation structure
- `make clean` - Clean build artifacts

## 🏗️ Project Structure

```
├── website/                 # Docusaurus site
│   ├── docs/               # Documentation content
│   ├── src/                # Custom React components
│   ├── static/             # Static assets
│   ├── docusaurus.config.js # Site configuration
│   └── sidebars.js         # Navigation structure
├── project/                # Agent implementations (reference)
├── netlify.toml           # Deployment configuration
└── Makefile              # Build automation
```

## 🚀 Deployment

### Prerequisites
- Node.js 18+ and npm
- Netlify CLI for deployment

### Setup Deployment
```bash
make setup-netlify    # Install Netlify CLI
netlify login         # Authenticate
netlify init          # Connect to site
```

### Deploy
```bash
make deploy-preview   # Deploy preview (non-interactive)
make deploy-prod      # Deploy production (non-interactive)
```

## 🔧 Local Development

### Start Development Server
```bash
make dev              # Port 3000 (default)
make dev-alt          # Port 3030 (alternative)
```

### Test Build Locally
```bash
make build            # Build site
make serve            # Serve built site locally
```

## 📖 Documentation

This project documents the Newo SuperAgent platform including:
- **Core Platform**: Architecture and system analysis
- **Agent System**: 9 specialized agents with flows and skills
- **Event System**: Event-driven orchestration
- **Actions API**: 35+ available actions and functions
- **Integration**: Development and deployment guides

## 🛠️ Tech Stack

- **Docusaurus 3.8+**: Modern documentation framework
- **React 18**: Component framework
- **Mermaid**: Diagram rendering
- **Netlify**: Deployment and hosting
- **Node.js 18**: Runtime environment

## 📋 Development Rules

- Edit documentation in `website/docs/`
- Test locally before deploying: `make test`
- Use `make deploy-preview` before production
- Agent code in `project/` is reference only
- All changes should be tested and validated

## 🤝 Contributing

1. Make changes to documentation files
2. Test locally: `make dev`
3. Validate: `make test`
4. Deploy preview: `make deploy-preview`
5. Share preview URL for review
6. Deploy to production: `make deploy-prod`

---

For detailed development information, see [CLAUDE.md](./CLAUDE.md).