# Fantasy Writing App - Project Page Redesign TODO

## 🎯 Overview
Complete redesign of the project pages to create a professional, Scrivener-inspired writing environment with subtle fantasy theming. Based on component audit, we have **60% reusable components** and an excellent existing fantasy color system.

**Design Vision**: Clean professional UI with "Parchment & Ink" (light) and "Midnight Scriptorium" (dark) themes  
**Platforms**: Mobile-first, responsive Web, iOS, Android  
**Key Finding**: `fantasyMasterColors.ts` already provides comprehensive theming

---

## 📊 Quick Reference
- **Reusable Components**: Button, TextInput, DatePicker, ErrorBoundary, VirtualizedLists
- **Enhance Existing**: ProjectCard, ElementCard, GlobalSearch, MobileHeader
- **Must Build**: ThemeProvider, AppShell, ProgressRing, StatsCard, BottomNavigation
- **Existing Colors**: fantasyMasterColors has everything needed (RPG attributes, UI colors, metals)

---

## Phase 1: Foundation & Theme System (Week 1)
*Leverage existing fantasyMasterColors and create missing infrastructure*

### 1.1 Theme Provider Setup ✨ QUICK WIN
- [x] Create `src/providers/ThemeProvider.tsx` using existing `fantasyMasterColors`
  - [x] Import and wrap fantasyMasterColors
  - [x] Implement theme context with light/dark modes
  - [x] Map colors: parchment (light) / obsidian (dark) 
  - [x] Add theme persistence to AsyncStorage
  - [x] Create useTheme hook
  - [x] System preference detection

### 1.2 Update Existing Components ✨ QUICK WIN
- [x] Replace hardcoded colors in `Button.tsx` with theme tokens
  - [x] Primary: `attributes.swiftness` (blue)
  - [x] Secondary: `ui.metals.silver`
  - [x] Danger: `semantic.dragonfire` (red)
- [x] Update `ProjectCard.tsx` styles
  - [x] Background: `ui.parchment`
  - [x] Borders: `ui.metals.gold.antique`
  - [x] Text: `ui.ink.primary`
- [x] Add missing `testID` attributes to all components
  - [x] GlobalSearch.tsx - Added comprehensive testID attributes
  - [x] CreateProjectModal.tsx - Added all interactive element testIDs
  - [x] TemplateSelector.tsx - Added testID attributes to buttons and inputs

### 1.3 Build AppShell Layout (NEW)
- [x] Create `src/components/layout/AppShell.tsx`
  - [x] Desktop: 3-column layout (sidebar | content | inspector)
  - [x] Tablet: 2-column layout (collapsible sidebar | content)
  - [x] Mobile: Single column with bottom navigation
  - [x] Use existing responsive utilities from platform detection
- [x] Adapt `MobileHeader.tsx` → responsive Sidebar ✓
  - [x] Enhance for desktop/tablet views
  - [x] Add collapsible sections
  - [x] Integrate with existing navigation
  - Created comprehensive Sidebar.tsx with mobile/tablet/desktop modes
  - Full theme integration and navigation support
  - Animated transitions for mobile drawer and tablet collapse

### 1.4 Typography System ✓
- [x] Configure fonts (check if already installed)
  - [x] Headers: Cinzel or system serif fallback
  - [x] Body: EB Garamond or system serif
  - [x] UI: Inter or system sans-serif
- [x] Create typography utilities using theme
  - Created comprehensive typography.ts with cross-platform support
  - Integrated with ThemeProvider for theme-aware text styles
  - Added Google Fonts to web/index.html

---

## Phase 2: Core Component Enhancements (Week 2)
*Build on existing components and add missing visualization*

### 2.1 Enhance ProjectCard (EXISTING) ✅
Based on audit, ProjectCard needs:
- [x] Add progress visualization
  - [x] Create `ProgressRing` component (NEW)
  - [x] Integrate into card layout
- [x] Add cover image support
  - [x] Use existing Image component patterns
  - [x] Fallback to folder icon (already present)
- [x] Add stats display section
  - [x] Word count with icon
  - [x] Chapter count
  - [x] Last updated (already present)
- [x] Apply fantasy theme
  - [x] Subtle parchment texture background
  - [x] Gold accent borders from `ui.metals.gold`
  - [x] Fantasy shadow effects from `effects.shadow`

### 2.2 Build Missing Visualization Components (NEW) ✓
- [x] Create `src/components/ProgressRing.tsx` ✓
  - [x] SVG circular progress indicator
  - [x] Use attribute colors for progress
  - [x] Size variants: small/medium/large/xlarge
  - [x] Animated transitions with Animated API
- [x] Create `src/components/StatsCard.tsx` ✓
  - [x] Metric display with icons
  - [x] Use fantasy colors for categories
  - [x] Trend indicators (up/down/stable)
  - [x] Number animations with smooth transitions

### 2.3 Enhance ElementCard (EXISTING) ✅
- [x] Add completeness indicator using ProgressRing
- [x] Add relationship count badge
- [x] Apply element type colors from `elements` object
- [x] Update with new theme system

### 2.4 Navigation Components (NEW) ✅
- [x] Create `src/components/BottomNavigation.tsx` for mobile
  - [x] Projects, Elements, Tools, Settings tabs
  - [x] Use existing Button patterns
  - [x] Active state with attribute colors
- [x] Create `src/components/ViewToggle.tsx`
  - [x] Grid/List view switcher
  - [x] Persist preference in store
  - [x] Smooth transitions

---

## Phase 3: Project Dashboard Implementation (Week 3)
*The main landing page - first thing users see*

### 3.1 Update ProjectsScreen ✅
- [x] Implement responsive grid/list layouts
  - [x] Use existing `VirtualizedProjectList` for performance
  - [x] Grid: 1 col (mobile), 2 cols (tablet), 3-4 cols (desktop)
  - [x] List: Enhanced table view with inline stats
- [x] Add hero stats section at top
  - [x] Use new StatsCard components
  - [x] Total words, projects, streak
  - [x] Mini activity graph
- [x] Integrate enhanced ProjectCard components
- [x] Add floating action button (FAB) for mobile
  - [x] Create new project
  - [x] Context-aware actions

### 3.2 Enhance Search & Filters ✅
- [x] Upgrade `GlobalSearch.tsx` (EXISTING)
  - [x] Add Command+K keyboard shortcut
  - [x] Apply fantasy theme styling
  - [x] Search across projects and elements
  - [x] Recent searches with AsyncStorage
- [x] Add filter controls
  - [x] By genre (already in Project type)
  - [x] By status (active/completed/on-hold)
  - [x] By last modified
  - [x] Clear all filters
- [x] Created `GlobalSearchTrigger.tsx` for app-level shortcut handling
- [x] Created `ProjectFilter.tsx` with comprehensive filtering options

### 3.3 Enhance Modals ✅
- [x] Update `CreateProjectModal.tsx` (EXISTING)
  - [x] Add cover image upload
  - [x] Template selection (future templates)
  - [x] Genre picker (use existing CrossPlatformPicker)
  - [x] Apply fantasy theme
- [x] Update `EditProjectModal.tsx` similarly

---

## Phase 4: Element Management & World Codex (Week 4)
*Leverage existing element system*

### 4.1 Element List Improvements
- [x] Use existing `VirtualizedElementList.tsx` for performance (Created VirtualizedElementListV2.tsx)
- [x] Apply element type colors from `fantasyMasterColors.elements`
  - [x] Character: warrior red
  - [x] Location: vitality green
  - [x] Item: gold
  - [x] Magic: guardian purple
  - [x] etc.
- [x] Add completeness indicators (Using ProgressRing component)
- [x] Enhance filtering by type/tags

### 4.2 Inspector Panel (NEW)
- [x] Create `src/components/layout/Inspector.tsx`
  - [x] Contextual content based on selection
  - [x] Details, Relationships, History tabs
  - [x] Quick actions (edit, delete, duplicate)
  - [x] Collapsible for tablet/desktop

### 4.3 Relationship Visualization
- [x] Enhance existing `RelationshipGraph.tsx` (Created RelationshipGraphV2.tsx)
  - [x] Apply fantasy colors to nodes
  - [x] Improve layout algorithm (Card-based responsive layout)
  - [ ] Add zoom/pan controls (Requires react-native-svg library)
  - [x] Filter by relationship type

---

## Phase 5: Polish & Animations (Week 5)
*Add professional polish using existing patterns*

### 5.1 Apply Fantasy Textures ✅
- [x] Add subtle parchment texture (5% opacity) to backgrounds ✅
  - Created ParchmentTexture.tsx component with cross-platform support
  - Applied to ProjectCard with BackgroundWithTexture wrapper
- [x] Celtic knot border SVGs for special cards ✅
  - Created CelticBorder.tsx with SVG patterns for web
  - Mobile fallback with styled Views and corner decorations
  - Multiple variants: simple, ornate, corner, full
- [x] Implement using existing Image/SVG patterns ✅
- [x] Keep subtle - professional not kitsch ✅

### 5.2 Micro-interactions
- [x] Button press effects (enhance existing Button) ✅
  - [x] Implemented smooth spring animations for scale
  - [x] Added opacity transitions with timing animations
  - [x] Platform-specific elevation effects for depth
  - [x] Proper disabled state handling
- [x] Card hover/lift animations ✅
  - [x] Hover effects with scale and lift for web
  - [x] Press animations with smooth spring effects
  - [x] Long press wiggle animation for mobile
  - [x] Shadow and elevation animations
- [x] Smooth accordion collapses for sidebar ✅
  - Implemented smooth height animations with Animated API
  - Added rotation animation for toggle arrows
  - Opacity fade-in/out for content visibility
  - LayoutAnimation fallback for mobile
- [x] Progress animations for ProgressRing ✅
- [x] Use React Native Animated API ✅

### 5.3 Loading States
- [x] Create skeleton screens for cards ✅
- [x] Shimmer effects while loading ✅
- [x] Use existing ActivityIndicator patterns ✅
- [x] Smooth content reveal animations ✅ (ContentReveal component with 10 animation types)

### 5.4 Mobile Gestures
- [x] Swipe to delete/archive (iOS pattern) ✅ (SwipeableRow component)
- [x] Pull to refresh for sync ✅ (Enhanced PullToRefresh component)
- [x] Long press for context menus ✅ (Already in ProjectCard with wiggle animation)
- [ ] Pinch to zoom on relationship graph

---

## Phase 6: Performance & Testing (Week 6)
*Optimize and validate*

### 6.1 Performance Optimization
- [x] Audit bundle size with webpack-bundle-analyzer ✅
  - Configured and ran analyzer to generate bundle report
  - Identified optimization opportunities
- [x] Implement code splitting for routes ✅
  - Added React.lazy() for all route components
  - Wrapped components with Suspense boundaries
  - Webpack already configured for optimal chunk splitting
- [x] Optimize images (compress, lazy load) ✅
  - Created LazyImage component with progressive loading
  - Updated ProjectCard to use LazyImage
  - Added viewport detection for web lazy loading
- [x] Already have VirtualizedLists ✅
- [x] Add React.memo to expensive components ✅
  - StatsCard wrapped with React.memo
  - ProjectCard and ElementCard already memoized
- [x] Debounce search and filter inputs ✅
  - Created useDebounce hook with multiple variants
  - Updated GlobalSearch with useSearchDebounce
  - Updated ProjectFilter with useFilterDebounce

### 6.2 Sync Improvements
- [x] Enhance existing `SyncQueueStatus.tsx` ✅
  - [x] Better visual feedback ✅
    - Added animations (rotate, scale, fade)
    - Status indicators with colored dots and icons
    - Real-time network connectivity monitoring
  - [x] Conflict resolution UI ✅
    - Modal for handling conflicts
    - Options to keep local/remote versions
    - Visual conflict display in queue
  - [x] Offline mode indicators ✅
    - Network status badge
    - Offline mode detection using NetInfo
    - Clear visual indication when offline
- [x] Implement delta syncing for changes ✅
  - Created deltaSyncService.ts with change tracking
  - Tracks create/update/delete operations
  - Builds minimal sync payloads
  - Handles conflict resolution
- [x] Queue offline changes properly ✅
  - Created offlineQueueManager.ts with retry logic
  - Priority-based queue processing
  - Dependency management for sync order
  - Persistent storage with AsyncStorage

### 6.3 Testing
- [x] Add Cypress tests for new components ✅
  - [x] All components need `testID` attributes ✅ (SyncQueueStatus has proper testID)
  - [x] Test responsive breakpoints ✅ (Included in component & E2E tests)
  - [ ] Test theme switching
  - [x] Created comprehensive component tests for SyncQueueStatus
  - [x] Created E2E tests for sync services (delta & offline)
- [x] Unit tests for new utilities ✅
  - [x] Created comprehensive unit tests for deltaSyncService (599 lines)
  - [x] Created comprehensive unit tests for offlineQueueManager (722 lines)
  - Note: Jest configuration needs update for PostCSS/NativeWind compatibility
- [ ] Manual testing on iOS/Android devices
- [ ] Performance testing with Lighthouse

---

## 🚀 Implementation Order (Prioritized)

### Week 1: Foundation (MUST HAVE)
1. **ThemeProvider with fantasyMasterColors** ← Start here
2. **Update Button & ProjectCard with theme**
3. **AppShell layout structure**
4. **Responsive sidebar from MobileHeader**

### Week 2: Core Components
1. **ProgressRing component**
2. **StatsCard component**
3. **Enhanced ProjectCard**
4. **Bottom navigation for mobile**

### Week 3: Dashboard
1. **Project dashboard with stats**
2. **Grid/list views with existing virtualization**
3. **Enhanced search with Command+K**
4. **FAB for mobile**

### Week 4: Elements & Polish
1. **Inspector panel**
2. **Element enhancements**
3. **Animations and transitions**
4. **Loading states**

### Week 5-6: Testing & Optimization
1. **Performance audit and optimization**
2. **Comprehensive testing**
3. **Bug fixes and polish**
4. **Documentation updates**

---

## ✅ Quick Wins (Can Do Immediately)
1. Apply `fantasyMasterColors` to Button component (< 1 hour)
2. Add missing `testID` attributes (< 30 mins)
3. Create basic ThemeProvider wrapper (< 2 hours)
4. Style GlobalSearch with fantasy theme (< 1 hour)

---

## 📝 Technical Notes

### Existing Assets to Leverage
- **Colors**: `fantasyMasterColors.ts` has complete system
- **Components**: 70% of UI components ready
- **State**: Zustand store already set up
- **Lists**: Virtualization already implemented
- **Sync**: Queue system exists

### Components Needing Enhancement
- ProjectCard (add progress, stats, theming)
- ElementCard (add completeness, badges)
- GlobalSearch (add keyboard shortcut, theming)
- Modals (add new fields, theming)

### New Components Required
- ThemeProvider (wrapper for colors)
- AppShell (layout structure)
- ProgressRing (visualization)
- StatsCard (metrics display)
- BottomNavigation (mobile nav)
- Inspector (detail panel)
- FAB (floating action button)
- ViewToggle (grid/list switch)

### Design Decisions
- Mobile-first responsive approach
- Subtle fantasy theming (not overwhelming)
- Professional Scrivener-inspired UI
- Performance over decorative elements
- Cross-platform consistency

---

## 🎯 Success Metrics
- [ ] All components use theme tokens (no hardcoded colors)
- [ ] 100% of interactive elements have testID
- [ ] Responsive on all screen sizes
- [ ] Theme switching works smoothly
- [ ] Virtual scrolling handles 100+ projects
- [ ] Load time < 3 seconds
- [ ] Lighthouse score > 90

---

## 📚 Reference Documents
- `/docs/PROJECT_PAGE_REDESIGN.md` - Full design specification
- `/docs/COMPONENT_AUDIT_RESULTS.md` - Existing component analysis
- `/docs/COMPONENT_IMPLEMENTATION_STRATEGY.md` - Implementation details
- `/src/constants/fantasyMasterColors.ts` - Color system