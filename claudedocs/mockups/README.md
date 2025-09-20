# Fantasy Writing App - HTML Mockups

This directory contains HTML/CSS mockups that provide a 1:1 representation of the current Fantasy Writing App implementation. These static mockups are used for rapid design iteration, stakeholder review, and as a reference for component implementation.

## 📁 Directory Structure

```
mockups/
├── index.html                # Navigation hub for all mockups
├── login.html               # Authentication and onboarding screen
├── projects.html            # Project list and management
├── project-dashboard.html   # Project overview with element categories
├── element-editor.html      # Element creation and editing interface
├── settings.html            # App settings and preferences
├── navigation-example.html  # Responsive navigation demonstration
├── css/                     # Stylesheets
│   ├── base.css            # Reset and base styles
│   ├── components.css      # Component-specific styles
│   ├── navigation.css      # Navigation components (header/sidebar)
│   ├── responsive.css      # Responsive breakpoints
│   ├── theme.css           # Theme variables and dark mode
│   └── tokens.css          # Design tokens from fantasyMasterColors
├── js/                      # JavaScript helpers
│   └── mockup-helpers.js   # Theme toggle and interactive features
├── includes/                # Reusable components
│   └── navigation.html     # Navigation template
├── images/                  # Image assets
└── assets/                  # Other static assets
```

## 🚀 Quick Start

### Viewing Mockups Locally

1. **Using VS Code Live Server Extension (Recommended)**:
   - Install the "Live Server" extension in VS Code
   - Right-click on `index.html` and select "Open with Live Server"
   - Navigate through mockups with hot reload on changes

2. **Using Python HTTP Server**:
   ```bash
   cd mockups
   python3 -m http.server 8000
   # Open http://localhost:8000 in your browser
   ```

3. **Using Node HTTP Server**:
   ```bash
   npx http-server mockups -p 8000
   # Open http://localhost:8000 in your browser
   ```

4. **Direct File Opening**:
   - Simply open `index.html` in your browser
   - Note: Some features may not work due to CORS restrictions

## 📱 Responsive Design

The mockups implement a mobile-first responsive design with the following breakpoints:

- **Mobile**: < 768px (default)
- **Tablet**: 768px - 1023px
- **Desktop**: ≥ 1024px

### Navigation Behavior
- **Mobile/Tablet**: Hamburger menu with slide-out drawer
- **Desktop**: Fixed sidebar navigation

Test responsive behavior by:
1. Resizing your browser window
2. Using browser developer tools device emulation
3. Opening on actual devices

## 🎨 Design System

### Color Palette
The app uses a fantasy-themed color system based on RPG attributes:
- **Parchment**: Background colors (#F5F0E6 base)
- **Ink**: Text colors (#1A1613 primary)
- **Metals**: Gold, silver, bronze accent colors
- **Magic Schools**: Element-specific colors (fire, water, earth, etc.)
- **Character Classes**: Role-based colors (warrior, mage, rogue, etc.)

### Typography
- **Headers**: Cinzel (serif, fantasy-themed)
- **Body Text**: EB Garamond (serif, readable)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Dark Mode
Toggle between light and dark themes using the sun/moon button in the bottom-right corner. The theme preference is saved in localStorage.

## 🔧 Development Workflow

### 1. Design Iteration Process
1. Make changes to HTML/CSS mockups
2. Preview with Live Server for instant feedback
3. Test responsive behavior across breakpoints
4. Validate design with stakeholders
5. Document approved changes

### 2. Component Development Flow
1. Design in mockups → Get approval
2. Implement as React Native component
3. Create Storybook stories for documentation
4. Write tests for functionality
5. Update mockups if implementation differs

### 3. Keeping Mockups in Sync
When the app implementation changes:
1. Update corresponding mockup HTML/CSS
2. Ensure design tokens match app constants
3. Test responsive behavior matches app
4. Document any platform-specific differences

## 📝 Page Descriptions

### index.html
- Navigation hub for all mockups
- Overview of design system features
- Quick access to all pages

### login.html
- Authentication form with email/password
- Social login options
- Password recovery link
- Responsive centered layout

### projects.html
- Grid layout of project cards
- Create new project form
- Empty state design
- Responsive grid (1-3 columns)

### project-dashboard.html
- Element category grid
- Progress tracking
- Quick actions
- Responsive layout

### element-editor.html
- Dynamic questionnaire system
- Rich text editor mockup
- Relationship management
- Auto-save indicator

### settings.html
- Theme toggle
- Account management
- Sync status
- Preference controls

### navigation-example.html
- Demonstrates responsive navigation
- Mobile hamburger menu
- Desktop sidebar
- Interactive example

## 🎯 Design Tokens

Design tokens are imported from the React Native app to ensure consistency:

```css
/* Imported from src/constants/fantasyMasterColors.ts */
--parchment-50: #FDFCFA;
--parchment-100: #FAF8F3;
--ink-primary: #1A1613;
--metals-gold: #FFD700;
/* ... and more */
```

These tokens are used throughout the mockups to maintain visual consistency with the app.

## ✅ Validation Checklist

Before considering a mockup complete:
- [ ] Matches current app implementation
- [ ] Responsive design works on all breakpoints
- [ ] Dark mode styling is complete
- [ ] All interactive elements have data-cy attributes
- [ ] Navigation is functional
- [ ] Design tokens are properly applied
- [ ] Accessibility considerations (ARIA labels, semantic HTML)

## 🔄 Updating Mockups

When updating mockups:
1. Always test on multiple viewport sizes
2. Verify dark mode still works correctly
3. Check that navigation remains functional
4. Update this README if adding new pages
5. Ensure design tokens are consistently applied

## 🐛 Known Issues & Limitations

- Rich text editor is a visual mockup only (not functional)
- Form submissions don't persist data (static HTML)
- Some animations may differ from React Native implementation
- File upload components are visual only

## 📚 Resources

- [React Native Web Documentation](https://necolas.github.io/react-native-web/)
- [Design Tokens Specification](https://www.w3.org/community/design-tokens/)
- [Live Server VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)

## 🤝 Contributing

When contributing to mockups:
1. Follow the existing structure and naming conventions
2. Use design tokens instead of hardcoded colors
3. Test on multiple browsers (Chrome, Firefox, Safari)
4. Ensure responsive design works correctly
5. Add data-cy attributes for testability
6. Update this README for significant changes

---

For questions or issues with the mockups, please refer to the main project documentation or create an issue in the repository.