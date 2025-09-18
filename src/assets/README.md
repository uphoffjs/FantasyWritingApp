# Asset Pipeline

This directory contains all shared assets for the FantasyWritingApp across platforms.

## Directory Structure

```
assets/
├── images/              # Raster images (PNG, JPG)
│   ├── 1x/             # Standard resolution
│   ├── 2x/             # Retina/high-DPI (@2x)
│   └── 3x/             # Super Retina (@3x)
├── icons/              # App icons and UI icons
│   ├── svg/            # Original SVG files
│   ├── png/            # Exported PNGs for React Native
│   └── web/            # Optimized for web (favicons, PWA)
├── fonts/              # Custom fonts
└── mockup-assets/      # Assets used in HTML mockups
```

## Usage

### React Native
```javascript
import { Image } from 'react-native';

// React Native automatically picks the right resolution
<Image source={require('@assets/images/logo.png')} />
```

### Web/Storybook
```javascript
// Direct import for web
import logo from '@assets/images/1x/logo.png';
import logo2x from '@assets/images/2x/logo.png';

<img 
  src={logo} 
  srcSet={`${logo2x} 2x`}
  alt="Logo"
/>
```

### HTML Mockups
```html
<!-- Use relative paths from mockups directory -->
<img src="../src/assets/images/1x/logo.png" 
     srcset="../src/assets/images/2x/logo.png 2x"
     alt="Logo">
```

## Asset Guidelines

### Images
- **Formats**: PNG for transparency, JPG for photos
- **Resolutions**: Always provide 1x, 2x, and 3x versions
- **Naming**: Use kebab-case (e.g., `character-avatar.png`)
- **Optimization**: Run through image optimizer before committing

### Icons
- **Source**: Keep original SVG files in `icons/svg/`
- **Sizes**: Export to standard sizes (16, 24, 32, 48, 64, 128px)
- **React Native**: Export as PNG with transparency
- **Web**: Use SVG directly when possible

### Naming Convention
```
element-type-variant-state.ext
Examples:
- character-avatar-default.png
- icon-sword-active.svg
- background-parchment-dark.jpg
```

## Optimization

Run the optimization script to prepare assets:
```bash
npm run optimize-assets
```

This will:
1. Compress images without quality loss
2. Generate missing resolutions
3. Create sprite sheets for icons
4. Copy assets to platform-specific directories