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

### 2.1 Enhance ProjectCard (EXISTING)
Based on audit, ProjectCard needs:
- [ ] Add progress visualization
  - [ ] Create `ProgressRing` component (NEW)
  - [ ] Integrate into card layout
- [ ] Add cover image support
  - [ ] Use existing Image component patterns
  - [ ] Fallback to folder icon (already present)
- [ ] Add stats display section
  - [ ] Word count with icon
  - [ ] Chapter count
  - [ ] Last updated (already present)
- [ ] Apply fantasy theme
  - [ ] Subtle parchment texture background
  - [ ] Gold accent borders from `ui.metals.gold`
  - [ ] Fantasy shadow effects from `effects.shadow`

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

### 2.3 Enhance ElementCard (EXISTING)
- [ ] Add completeness indicator using ProgressRing
- [ ] Add relationship count badge
- [ ] Apply element type colors from `elements` object
- [ ] Update with new theme system

### 2.4 Navigation Components (NEW)
- [ ] Create `src/components/BottomNavigation.tsx` for mobile
  - [ ] Projects, Elements, Tools, Settings tabs
  - [ ] Use existing Button patterns
  - [ ] Active state with attribute colors
- [ ] Create `src/components/ViewToggle.tsx`
  - [ ] Grid/List view switcher
  - [ ] Persist preference in store
  - [ ] Smooth transitions

---

## Phase 3: Project Dashboard Implementation (Week 3)
*The main landing page - first thing users see*

### 3.1 Update ProjectsScreen
- [ ] Implement responsive grid/list layouts
  - [ ] Use existing `VirtualizedProjectList` for performance
  - [ ] Grid: 1 col (mobile), 2 cols (tablet), 3-4 cols (desktop)
  - [ ] List: Enhanced table view with inline stats
- [ ] Add hero stats section at top
  - [ ] Use new StatsCard components
  - [ ] Total words, projects, streak
  - [ ] Mini activity graph
- [ ] Integrate enhanced ProjectCard components
- [ ] Add floating action button (FAB) for mobile
  - [ ] Create new project
  - [ ] Context-aware actions

### 3.2 Enhance Search & Filters
- [ ] Upgrade `GlobalSearch.tsx` (EXISTING)
  - [ ] Add Command+K keyboard shortcut
  - [ ] Apply fantasy theme styling
  - [ ] Search across projects and elements
  - [ ] Recent searches with AsyncStorage
- [ ] Add filter controls
  - [ ] By genre (already in Project type)
  - [ ] By status (active/completed/on-hold)
  - [ ] By last modified
  - [ ] Clear all filters

### 3.3 Enhance Modals
- [ ] Update `CreateProjectModal.tsx` (EXISTING)
  - [ ] Add cover image upload
  - [ ] Template selection (future templates)
  - [ ] Genre picker (use existing CrossPlatformPicker)
  - [ ] Apply fantasy theme
- [ ] Update `EditProjectModal.tsx` similarly

---

## Phase 4: Element Management & World Codex (Week 4)
*Leverage existing element system*

### 4.1 Element List Improvements
- [ ] Use existing `VirtualizedElementList.tsx` for performance
- [ ] Apply element type colors from `fantasyMasterColors.elements`
  - [ ] Character: warrior red
  - [ ] Location: vitality green
  - [ ] Item: gold
  - [ ] Magic: guardian purple
  - [ ] etc.
- [ ] Add completeness indicators
- [ ] Enhance filtering by type/tags

### 4.2 Inspector Panel (NEW)
- [ ] Create `src/components/layout/Inspector.tsx`
  - [ ] Contextual content based on selection
  - [ ] Details, Relationships, History tabs
  - [ ] Quick actions (edit, delete, duplicate)
  - [ ] Collapsible for tablet/desktop

### 4.3 Relationship Visualization
- [ ] Enhance existing `RelationshipGraph.tsx`
  - [ ] Apply fantasy colors to nodes
  - [ ] Improve layout algorithm
  - [ ] Add zoom/pan controls
  - [ ] Filter by relationship type

---

## Phase 5: Polish & Animations (Week 5)
*Add professional polish using existing patterns*

### 5.1 Apply Fantasy Textures
- [ ] Add subtle parchment texture (5% opacity) to backgrounds
- [ ] Celtic knot border SVGs for special cards
- [ ] Implement using existing Image/SVG patterns
- [ ] Keep subtle - professional not kitsch

### 5.2 Micro-interactions
- [ ] Button press effects (enhance existing Button)
- [ ] Card hover/lift animations
- [ ] Smooth accordion collapses for sidebar
- [ ] Progress animations for ProgressRing
- [ ] Use React Native Animated API

### 5.3 Loading States
- [ ] Create skeleton screens for cards
- [ ] Shimmer effects while loading
- [ ] Use existing ActivityIndicator patterns
- [ ] Smooth content reveal animations

### 5.4 Mobile Gestures
- [ ] Swipe to delete/archive (iOS pattern)
- [ ] Pull to refresh for sync
- [ ] Long press for context menus
- [ ] Pinch to zoom on relationship graph

---

## Phase 6: Performance & Testing (Week 6)
*Optimize and validate*

### 6.1 Performance Optimization
- [ ] Audit bundle size with webpack-bundle-analyzer
- [ ] Implement code splitting for routes
- [ ] Optimize images (compress, lazy load)
- [ ] Already have VirtualizedLists ✅
- [ ] Add React.memo to expensive components
- [ ] Debounce search and filter inputs

### 6.2 Sync Improvements
- [ ] Enhance existing `SyncQueueStatus.tsx`
  - [ ] Better visual feedback
  - [ ] Conflict resolution UI
  - [ ] Offline mode indicators
- [ ] Implement delta syncing for changes
- [ ] Queue offline changes properly

### 6.3 Testing
- [ ] Add Cypress tests for new components
  - [ ] All components need `testID` attributes
  - [ ] Test responsive breakpoints
  - [ ] Test theme switching
- [ ] Unit tests for new utilities
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