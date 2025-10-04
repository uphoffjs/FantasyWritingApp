# Fantasy Writing App

A comprehensive worldbuilding tool for fiction writers, built with React Native and deployable as a Progressive Web App (PWA).

## Overview

Fantasy Writing App (evolved from Fantasy Element Builder) is a powerful tool designed to help fiction writers develop and organize the various elements of their fictional worlds. It provides structured questionnaires, relationship management, and organization tools for creating rich, consistent fictional universes.

## Current Status

- **Phase 0**: ✅ Complete - React Native Web setup with PWA support
- **Phase 1**: ✅ Complete - Store & Data Layer Conversion with cross-platform storage
- **Phase 2**: ✅ Partial Complete - Navigation system and basic UI components implemented
- **Phase 3**: 🚧 Next - Feature Implementation (Questionnaires, Elements, Relationships)
- **Phase 4-5**: 📋 Planned - PWA deployment and native app preparation

## Tech Stack

- **Framework**: React Native 0.75.4 with TypeScript 5.2.2
- **Web Support**: React Native Web for PWA deployment
- **State Management**: Zustand with persistence
- **Build Tool**: Vite 5.x (migrated from Webpack)
- **Testing**: Cypress 14.5.4 for E2E and component tests
- **PWA**: Service Worker for offline support
- **Backend**: Supabase (optional)

## Installation

```bash
# Clone or navigate to the project
cd FantasyWritingApp

# Install dependencies
npm install
```

## Development

### Web Development (PWA) - Primary Focus

```bash
# Start the Vite development server
npm run dev
# or
npm run web

# Opens at http://localhost:3002
# Dev server starts in <1 second with Vite!
```

### Build for Production

```bash
# Create optimized production build with Vite
npm run build

# Analyze bundle size
npm run build:analyze

# Preview production build locally
npm run preview

# Output will be in /dist directory
# Build time: ~18.5 seconds
```

### Native Development (Future)

```bash
# iOS (requires Mac with Xcode)
# First install pods:
cd ios && pod install && cd ..
npm run ios

# Android (requires Android Studio)
npm run android

# Start Metro bundler for native development
npm start
```

## Features

### Core Features (Being Migrated)
- ✅ Project management (create, edit, delete)
- ✅ Element creation system (characters, locations, etc.)
- ✅ Dynamic questionnaire engine
- ✅ Relationship management between elements
- ✅ Templates system
- ✅ Import/Export (JSON)
- ✅ Search and filtering
- ✅ Progress tracking
- ✅ Tag system
- ✅ Dark theme UI

### Element Categories
- Characters
- Locations
- Magic/Power Systems
- Cultures/Societies
- Creatures/Species
- Organizations
- Religions/Belief Systems
- Technologies
- Historical Events
- Languages

## Project Structure

```
FantasyWritingApp/
├── src/
│   ├── types/        # TypeScript type definitions
│   ├── utils/        # Utility functions
│   ├── store/        # Zustand state management
│   ├── components/   # React Native components
│   ├── screens/      # App screens
│   └── navigation/   # React Navigation setup
├── cypress/
│   ├── e2e/          # End-to-end tests
│   └── component/    # Component tests
├── docs/
│   └── migration/    # Vite migration documentation
├── .github/
│   └── workflows/    # CI/CD pipelines
├── index.html        # Vite entry HTML
├── vite.config.ts    # Vite configuration
├── vite.config.prod.ts # Production config
├── index.web.entry.js # Web entry point
├── ios/              # iOS native code (future)
└── android/          # Android native code (future)
```

## PWA Capabilities

- **Installable**: Can be installed on mobile/desktop devices
- **Offline Support**: Works without internet connection
- **App-like Experience**: Full-screen, standalone mode
- **Cross-platform**: Single codebase for web, iOS, and Android

## Migration from Fantasy Element Builder

This app is a complete rewrite of the Fantasy Element Builder, converting from React web to React Native for better mobile support and future native app deployment. All existing features are being preserved and enhanced with mobile-first design.

### Data Migration
Users can export their data from the original Fantasy Element Builder and import it into this new app once the import/export feature is implemented in Phase 3.

## Development Roadmap

### ✅ Phase 0: React Native Web Setup (Complete)
- Initialized React Native project
- Added React Native Web for PWA support
- Configured webpack for web builds
- Set up PWA manifest and service worker
- Copied existing types, utils, and store logic

### 🚧 Phase 1: Store & Data Layer (Week 1)
- Convert Zustand store for cross-platform storage
- Implement AsyncStorage/localStorage abstraction
- Maintain all data models and business logic

### 📋 Phase 2: Component Conversion (Weeks 2-3)
- Convert navigation from React Router to React Navigation
- Convert UI components to React Native
- Adapt styles from Tailwind CSS to StyleSheet

### 📋 Phase 3: Feature Preservation (Week 4)
- Questionnaire system
- Relationship management
- Template system
- Import/Export functionality
- Search and filtering

### 📋 Phase 4: PWA Deployment (Week 5)
- Production build optimization
- PWA feature enhancement
- Beta testing with ~20 users
- Performance optimization

### 📋 Phase 5: Native Preparation (Post-MVP)
- Configure iOS and Android projects
- Add native-specific features
- Submit to app stores

## Scripts

```json
{
  "scripts": {
    "dev": "vite --port 3002",
    "web": "vite --port 3002",
    "build": "vite build --config vite.config.prod.ts",
    "build:analyze": "vite build --config vite.config.prod.ts && open dist/stats.html",
    "preview": "vite preview --port 3002",
    "lint": "eslint . --ext ts,tsx",
    "test": "npm run test:component && npm run test:e2e",
    "test:component": "cypress run --component --browser electron --headless",
    "test:e2e": "start-server-and-test 'vite --port 3002' http://localhost:3002 'cypress run'",
    "cypress:open": "cypress open",

    "// Native scripts (future)": "",
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start"
  }
}
```

## Requirements

- Node.js >= 18.0.0 (v22.19.0 recommended)
- npm >= 8.0.0
- For iOS development: Xcode 12+
- For Android development: Android Studio

## Documentation

- [Vite Migration Guide](./docs/migration/deployment-guide-vite.md) - Complete deployment documentation
- [Vite Migration TODO](./VITE_MIGRATION_TODO.md) - Migration progress tracker
- [Claude Instructions](./CLAUDE.md) - Development guidelines and standards
- [Phase 0 Implementation Log](./PHASE_0_IMPLEMENTATION_LOG.md) - Details of initial setup

## Troubleshooting

### Web Development Issues
- Ensure all dependencies are installed: `npm install`
- Clear Vite cache if needed: `rm -rf node_modules/.vite`
- Check that port 3002 is available (Vite will auto-increment if busy)
- For build issues, check `vite.config.ts` for proper React Native Web configuration

### Native Development Issues
- For iOS: Make sure to run `cd ios && pod install`
- For Android: Ensure Android SDK is properly configured
- See [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting)

## License

Private project - All rights reserved

## Contact

For questions or issues related to the conversion process, please refer to the implementation documentation.