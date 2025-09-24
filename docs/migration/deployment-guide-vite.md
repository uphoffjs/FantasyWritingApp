# Vite Deployment Guide

**Last Updated**: 2025-09-24
**Migration Status**: Phase 4.3 - Deployment Preparation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Build Configuration](#build-configuration)
3. [Deployment Process](#deployment-process)
4. [Server Configuration](#server-configuration)
5. [CI/CD Integration](#cicd-integration)
6. [Environment Variables](#environment-variables)
7. [Deployment Checklist](#deployment-checklist)
8. [Troubleshooting](#troubleshooting)

## Overview

This guide documents the deployment process for the Fantasy Writing App after migration from Webpack to Vite. The new build system provides faster builds, better code splitting, and optimized bundles.

### Key Changes from Webpack
- Build output in `dist/` instead of `build/`
- ES modules-first approach
- Improved code splitting with manual chunks
- Built-in asset optimization
- Native environment variable handling with `VITE_` prefix

## Build Configuration

### Production Build Commands

```bash
# Standard production build
npm run build

# Build with bundle analysis
npm run build:analyze

# Preview production build locally
npm run preview
```

### Build Output Structure

```
dist/
├── index.html                 # Entry HTML with module scripts
├── js/
│   ├── index.[hash].js       # Main entry chunk
│   ├── react-core.[hash].js  # React dependencies
│   ├── navigation.[hash].js  # Navigation libraries
│   ├── ui-libs.[hash].js     # UI component libraries
│   ├── database.[hash].js    # Supabase client
│   └── [feature].[hash].js   # Feature-specific chunks
├── assets/
│   ├── [name].[hash].css     # Styled components CSS
│   ├── [name].[hash].png     # Optimized images
│   └── [name].[hash].svg     # SVG assets
└── stats.html                 # Bundle analysis report
```

### Build Performance Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Build Time | <20s | ~18.5s |
| Bundle Size (gzipped) | <500KB | ~450KB |
| Chunks Generated | 15-20 | 18 |
| Largest Chunk | <500KB | 402KB |

## Deployment Process

### 1. Pre-Deployment Checks

```bash
# Run tests
npm run test:e2e

# Build production bundle
npm run build

# Analyze bundle size
npm run build:analyze

# Preview locally
npm run preview
# Visit http://localhost:3002 to verify
```

### 2. Build Artifacts

The production build generates the following artifacts:
- `dist/` directory with all static assets
- Source maps for debugging (optional)
- Bundle analysis report (`dist/stats.html`)

### 3. Deployment Methods

#### Static Hosting (Netlify, Vercel, Surge)

```bash
# Netlify
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist

# Vercel
npm install -g vercel
npm run build
vercel --prod dist

# Surge
npm install -g surge
npm run build
surge dist your-app.surge.sh
```

#### Traditional Web Server (Nginx, Apache)

See [Server Configuration](#server-configuration) section below.

#### Cloud Platforms (AWS, Google Cloud, Azure)

```bash
# AWS S3 + CloudFront
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"

# Google Cloud Storage
gsutil -m rsync -r -d dist/ gs://your-bucket-name

# Azure Storage
az storage blob upload-batch -s dist -d $web --account-name youraccountname
```

## Server Configuration

### Nginx Configuration

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;

    root /var/www/fantasy-writing-app/dist;
    index index.html;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/javascript application/json application/xml+rss;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Apache Configuration (.htaccess)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Cache Control
<IfModule mod_headers.c>
  # Cache static assets for 1 year
  <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>
```

### Express.js Server

```javascript
const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable gzip compression
app.use(compression());

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y',
  etag: true
}));

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:e2e
        env:
          CI: true

      - name: Build application
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_APP_VERSION: ${{ github.sha }}
          VITE_ENVIRONMENT: production

      - name: Analyze bundle size
        run: |
          npm run build:analyze
          echo "Bundle size report generated"

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
          retention-days: 7

      # Example: Deploy to Netlify
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

      # Alternative: Deploy to S3
      # - name: Deploy to S3
      #   run: |
      #     aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete
      #     aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_ID }} --paths "/*"
      #   env:
      #     AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      #     AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

cache:
  paths:
    - node_modules/

test:
  stage: test
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run test:e2e
  only:
    - merge_requests
    - main

build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run build
    - npm run build:analyze
  artifacts:
    paths:
      - dist/
    expire_in: 1 week
  only:
    - main

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl
  script:
    - echo "Deploying to production..."
    # Add deployment commands here
  dependencies:
    - build
  only:
    - main
  environment:
    name: production
    url: https://your-app.com
```

### Jenkins Pipeline

Create `Jenkinsfile`:

```groovy
pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
        VITE_API_URL = credentials('vite-api-url')
        VITE_ENVIRONMENT = 'production'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                nodejs(nodeJSInstallationName: "Node ${NODE_VERSION}") {
                    sh 'npm ci'
                }
            }
        }

        stage('Test') {
            steps {
                nodejs(nodeJSInstallationName: "Node ${NODE_VERSION}") {
                    sh 'npm run test:e2e'
                }
            }
        }

        stage('Build') {
            steps {
                nodejs(nodeJSInstallationName: "Node ${NODE_VERSION}") {
                    sh 'npm run build'
                    sh 'npm run build:analyze'
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: false
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                // Add deployment steps
                echo 'Deploying to production...'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Build and deployment successful!'
        }
        failure {
            echo 'Build or deployment failed!'
        }
    }
}
```

## Environment Variables

### Configuration

All environment variables for Vite must be prefixed with `VITE_`:

```bash
# .env.production
VITE_API_URL=https://api.production.com
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
VITE_SENTRY_DSN=your-sentry-dsn
VITE_GA_TRACKING_ID=your-ga-id
```

### TypeScript Support

Ensure type safety for environment variables:

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_ENVIRONMENT: 'development' | 'staging' | 'production';
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_GA_TRACKING_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### Runtime Access

```typescript
// Access environment variables in code
const apiUrl = import.meta.env.VITE_API_URL;
const appVersion = import.meta.env.VITE_APP_VERSION;
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (`npm run test`)
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Build succeeds locally (`npm run build`)
- [ ] Bundle size acceptable (`npm run build:analyze`)
- [ ] Preview tested locally (`npm run preview`)
- [ ] Changelog updated
- [ ] Version bumped in package.json

### Deployment

- [ ] CI/CD pipeline triggered
- [ ] Build artifacts generated
- [ ] Tests pass in CI environment
- [ ] Deployment to staging successful
- [ ] Staging smoke tests passed
- [ ] Production deployment approved
- [ ] Deployment to production successful

### Post-Deployment

- [ ] Application accessible at production URL
- [ ] Core functionality verified
- [ ] Performance metrics acceptable
- [ ] Error monitoring active (Sentry, etc.)
- [ ] Analytics tracking verified
- [ ] SSL certificate valid
- [ ] DNS configured correctly
- [ ] CDN cache purged (if applicable)
- [ ] Team notified of deployment

## Troubleshooting

### Common Deployment Issues

#### 404 Errors on Routes

**Problem**: Direct navigation to routes returns 404
**Solution**: Configure server for SPA fallback to index.html

#### Missing Environment Variables

**Problem**: `undefined` values for environment variables
**Solution**: Ensure variables are prefixed with `VITE_` and available during build

#### Large Bundle Size

**Problem**: Bundle exceeds size limits
**Solution**:
- Review `npm run build:analyze` output
- Implement code splitting
- Lazy load routes and components
- Remove unused dependencies

#### CORS Issues

**Problem**: API requests blocked by CORS
**Solution**:
- Configure API server to allow your domain
- Use proxy configuration in development
- Ensure production API URL is correct

#### Cache Issues

**Problem**: Users see old version after deployment
**Solution**:
- Clear CDN cache
- Use cache-busting with hashed filenames (Vite does this automatically)
- Set appropriate cache headers

### Debug Commands

```bash
# Check build output
ls -lah dist/

# Verify environment variables
grep VITE_ .env.production

# Test production build locally
npm run build && npm run preview

# Check for large dependencies
npm ls --depth=0 | grep -E '[0-9]+\.[0-9]+ MB'

# Analyze bundle
npm run build:analyze
```

## Performance Optimization

### Build Optimizations

1. **Code Splitting**: Implemented via `manualChunks` in vite.config.prod.ts
2. **Tree Shaking**: Automatic with Vite's Rollup
3. **Compression**: Enable gzip/brotli on server
4. **Asset Optimization**: Images optimized during build
5. **Lazy Loading**: Routes and components loaded on demand

### Monitoring

Add performance monitoring to track deployment success:

```javascript
// src/utils/monitoring.ts
if (import.meta.env.PROD) {
  // Log build version
  console.log('App Version:', import.meta.env.VITE_APP_VERSION);

  // Track performance metrics
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'page_load', {
        'page_load_time': perfData.loadEventEnd - perfData.fetchStart,
        'dom_interactive': perfData.domInteractive - perfData.fetchStart,
        'first_contentful_paint': perfData.domContentLoadedEventEnd - perfData.fetchStart
      });
    }
  });
}
```

## Rollback Procedure

If issues arise after deployment:

1. **Immediate Rollback**:
   ```bash
   # Revert to previous deployment
   git revert HEAD
   git push origin main
   ```

2. **Using Previous Build Artifacts**:
   - Most CI/CD systems keep previous build artifacts
   - Redeploy the last known good version

3. **Emergency Webpack Fallback**:
   ```bash
   # If Vite issues are blocking
   git checkout backup/pre-vite-migration
   npm ci
   npm run webpack:build
   # Deploy webpack build
   ```

## Support and Resources

- **Vite Documentation**: https://vitejs.dev/guide/
- **Deployment Examples**: https://vitejs.dev/guide/static-deploy.html
- **React Native Web**: https://necolas.github.io/react-native-web/
- **Team Contact**: [Add team contact info]
- **Issue Tracking**: [Add issue tracker link]

---

**Document Version**: 1.0
**Last Review**: 2025-09-24
**Next Review**: [Add date]
**Owner**: [Add owner]