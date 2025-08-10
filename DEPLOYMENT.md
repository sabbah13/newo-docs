# 🚀 Deployment Guide: Newo SuperAgent Documentation

Complete guide for deploying your Docusaurus documentation site to Netlify and other platforms.

## 📋 Table of Contents
- [Netlify Deployment (Recommended)](#netlify-deployment-recommended)
- [Manual Build Commands](#manual-build-commands) 
- [Alternative Hosting Options](#alternative-hosting-options)
- [Production Configuration](#production-configuration)
- [Troubleshooting](#troubleshooting)

---

## 🌐 Netlify Deployment (Recommended)

Netlify offers the best experience for static sites with automatic builds, CDN, and preview deployments.

### Method 1: Git Integration (Recommended)

1. **Push to Git Repository**
   ```bash
   # Initialize git if not already done
   git init
   git add .
   git commit -m "Initial commit: Newo SuperAgent Documentation"
   
   # Push to GitHub, GitLab, or Bitbucket
   git remote add origin YOUR_REPOSITORY_URL
   git push -u origin main
   ```

2. **Deploy via Netlify Dashboard**
   - Go to [netlify.com](https://netlify.com) and sign up/login
   - Click "New site from Git"
   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository
   - Netlify will auto-detect the `netlify.toml` configuration
   - Click "Deploy site"

3. **Custom Domain (Optional)**
   - In Netlify dashboard: Site settings → Domain management
   - Add your custom domain
   - Follow DNS configuration instructions

### Method 2: Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   ```

2. **Deploy with Makefile Commands**
   ```bash
   # Create production build and deploy
   make deploy-netlify
   
   # Or create a preview deployment
   make deploy-preview
   ```

3. **Manual CLI Deployment**
   ```bash
   # Build the site
   make build-production
   
   # Deploy to Netlify
   cd website
   netlify deploy --prod --dir=build
   ```

---

## 🔧 Manual Build Commands

Use these commands for any hosting platform:

```bash
# Quick production build
make build-production

# Step-by-step manual build
make switch-new          # Switch to new documentation
cd website
npm ci                   # Install dependencies
npm run build           # Build for production
# Output will be in website/build/
```

### Build Output
- **Location**: `website/build/`
- **Type**: Static files (HTML, CSS, JS, assets)
- **Size**: ~50-100MB (depending on images and assets)
- **CDN Ready**: All files are optimized for CDN delivery

---

## 🌍 Alternative Hosting Options

### GitHub Pages
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Build
        run: |
          cd website
          npm ci
          npm run build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./website/build
```

### Vercel
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "website/package.json",
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["website/build/**"]
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/website/build/$1"
    }
  ]
}
```

### AWS S3 + CloudFront
```bash
# Build and sync to S3
make build-production
aws s3 sync website/build/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

---

## ⚙️ Production Configuration

### Environment Variables
Set these in your hosting platform:
```bash
NODE_VERSION=18
NPM_VERSION=9
BUILD_COMMAND="cd website && npm ci && npm run build"
PUBLISH_DIRECTORY="website/build"
```

### SEO and Analytics
Update `website/docusaurus-new.config.js`:
```javascript
// Google Analytics (optional)
gtag: {
  trackingID: 'G-YOUR_TRACKING_ID',
  anonymizeIP: true,
},

// Meta tags for SEO
metadata: [
  {name: 'keywords', content: 'digital employee, ai, automation, newo'},
  {name: 'author', content: 'Newo.ai'},
],
```

### Performance Optimization
```javascript
// In docusaurus.config.js
webpack: {
  jsLoader: (isServer) => ({
    loader: require.resolve('swc-loader'),
    options: {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
        },
        target: 'es2017',
      },
      module: {
        type: isServer ? 'commonjs' : 'es6',
      },
    },
  }),
},
```

---

## 🔍 Troubleshooting

### Common Build Issues

**Issue**: `Module not found` errors
```bash
# Solution: Clean install
cd website
rm -rf node_modules package-lock.json
npm install
```

**Issue**: `Out of memory` during build
```bash
# Solution: Increase Node.js memory
export NODE_OPTIONS="--max_old_space_size=4096"
npm run build
```

**Issue**: Missing assets or broken links
```bash
# Solution: Check base URL configuration
# In docusaurus-new.config.js:
baseUrl: '/',  # For root domain
# or
baseUrl: '/subdirectory/',  # For subdirectory
```

### Deployment Issues

**Issue**: 404 errors on page refresh
- **Netlify**: Already handled by `netlify.toml` redirects
- **Other hosts**: Configure server to serve `index.html` for all routes

**Issue**: CSS/JS not loading
- Check `baseUrl` in config matches deployment URL
- Ensure build output includes all static assets

### Performance Issues

**Issue**: Slow loading times
```bash
# Solutions:
1. Enable compression in netlify.toml (already configured)
2. Optimize images: npm install @docusaurus/plugin-ideal-image
3. Enable PWA: npm install @docusaurus/plugin-pwa
```

---

## 📊 Deployment Checklist

Before deploying:

- [ ] ✅ All links work locally (`make dev-new`)
- [ ] ✅ Build completes without errors (`make build-production`) 
- [ ] ✅ No console errors in browser
- [ ] ✅ All images and assets load properly
- [ ] ✅ Mobile responsiveness verified
- [ ] ✅ SEO meta tags configured
- [ ] ✅ Custom domain DNS configured (if applicable)
- [ ] ✅ SSL certificate active (automatic with Netlify)

After deploying:
- [ ] ✅ Site loads correctly on production URL
- [ ] ✅ All navigation works
- [ ] ✅ Mermaid diagrams render properly
- [ ] ✅ Search functionality works (when enabled)
- [ ] ✅ Forms and interactive elements function
- [ ] ✅ Site performs well (use PageSpeed Insights)

---

## 🎯 Quick Start Commands

```bash
# 1. Quick Netlify deployment
make deploy-netlify

# 2. Build for any hosting platform  
make build-production

# 3. Local testing before deployment
make dev-new

# 4. Clean build (if issues occur)
make clean && make build-production
```

---

## 📞 Support

For deployment issues:
- **Netlify**: Check build logs in Netlify dashboard
- **DNS Issues**: Use [DNS Checker](https://dnschecker.org/)
- **Performance**: Use [PageSpeed Insights](https://pagespeed.web.dev/)
- **SSL**: Most platforms provide automatic SSL certificates

**Documentation Built**: $(date)
**Docusaurus Version**: 3.8.1
**Node Version**: 18+