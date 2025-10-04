#!/usr/bin/env node

/**
 * * Asset Optimization Pipeline
 * * Processes and optimizes images/icons for all platforms
 * * Generates appropriate resolutions and copies to platform-specific directories
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// * Configuration
const ASSETS_DIR = path.join(__dirname, '../src/assets');
const IMAGES_DIR = path.join(ASSETS_DIR, 'images');
const ICONS_DIR = path.join(ASSETS_DIR, 'icons');
const MOCKUPS_ASSETS = path.join(ASSETS_DIR, 'mockup-assets');

// * Platform-specific output directories
const _IOS_IMAGES = path.join(__dirname, '../ios/FantasyWritingApp/Images.xcassets');
const _ANDROID_IMAGES = path.join(__dirname, '../android/app/src/main/res');
const WEB_PUBLIC = path.join(__dirname, '../public/assets');

// * Image resolutions for React Native
const RESOLUTIONS = {
  '1x': 1,
  '2x': 2,
  '3x': 3,
};

// * Icon sizes for different uses
const ICON_SIZES = {
  app: [16, 32, 48, 64, 128, 256, 512, 1024],
  ui: [16, 20, 24, 32, 40, 48, 64],
};

// * Check if ImageMagick is installed (for image processing)
function checkDependencies() {
  try {
    execSync('which convert', { stdio: 'ignore' });
    return true;
  } catch {
    console.log('⚠️  ImageMagick not found. Some features will be limited.');
    console.log('   Install with: brew install imagemagick (Mac) or apt-get install imagemagick (Linux)');
    return false;
  }
}

// * Create directory if it doesn't exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// * Process a single image to multiple resolutions
function processImage(inputPath, baseName) {
  const hasImageMagick = checkDependencies();
  
  if (!hasImageMagick) {
    // * Just copy the file if we can't process it
    console.log(`📋 Copying ${baseName} (ImageMagick not available for optimization)`);
    
    Object.keys(RESOLUTIONS).forEach((res) => {
      const outputDir = path.join(IMAGES_DIR, res);
      ensureDir(outputDir);
      const outputPath = path.join(outputDir, baseName);
      fs.copyFileSync(inputPath, outputPath);
    });
    return;
  }
  
  console.log(`🖼️  Processing ${baseName}...`);
  
  // * Get original dimensions
  const dimensions = execSync(`identify -format "%wx%h" "${inputPath}"`)
    .toString()
    .trim()
    .split('x');
  const width = parseInt(dimensions[0], 10);
  const height = parseInt(dimensions[1], 10);
  
  // * Generate each resolution
  Object.entries(RESOLUTIONS).forEach(([res, multiplier]) => {
    const outputDir = path.join(IMAGES_DIR, res);
    ensureDir(outputDir);
    
    const outputPath = path.join(outputDir, baseName);
    const newWidth = Math.round(width * multiplier);
    const newHeight = Math.round(height * multiplier);
    
    // * Resize and optimize
    try {
      execSync(
        `convert "${inputPath}" -resize ${newWidth}x${newHeight} -strip -quality 85 "${outputPath}"`
      );
      console.log(`   ✅ Generated ${res} (${newWidth}x${newHeight})`);
    } catch (error) {
      console.error(`   ❌ Failed to generate ${res}: ${error.message}`);
    }
  });
}

// * Process SVG icons to PNGs
function processIcon(svgPath, iconName) {
  const hasImageMagick = checkDependencies();
  
  if (!hasImageMagick) {
    console.log(`⚠️  Skipping ${iconName}.svg (ImageMagick required for SVG conversion)`);
    return;
  }
  
  console.log(`🎨 Processing icon: ${iconName}`);
  
  const pngDir = path.join(ICONS_DIR, 'png');
  ensureDir(pngDir);
  
  // * Generate different sizes
  ICON_SIZES.ui.forEach((size) => {
    const outputPath = path.join(pngDir, `${iconName}-${size}.png`);
    
    try {
      execSync(
        `convert -background none -density 300 -resize ${size}x${size} "${svgPath}" "${outputPath}"`
      );
      console.log(`   ✅ Generated ${size}x${size} PNG`);
    } catch (error) {
      console.error(`   ❌ Failed to generate ${size}x${size}: ${error.message}`);
    }
  });
}

// * Copy assets for web/mockups
function copyWebAssets() {
  console.log('🌐 Copying assets for web...');
  
  ensureDir(WEB_PUBLIC);
  ensureDir(MOCKUPS_ASSETS);
  
  // * Copy 2x images as default for web
  const images2x = path.join(IMAGES_DIR, '2x');
  if (fs.existsSync(images2x)) {
    const files = fs.readdirSync(images2x);
    files.forEach((file) => {
      const src = path.join(images2x, file);
      const webDest = path.join(WEB_PUBLIC, file);
      const mockupDest = path.join(MOCKUPS_ASSETS, file);
      
      fs.copyFileSync(src, webDest);
      fs.copyFileSync(src, mockupDest);
    });
    console.log(`   ✅ Copied ${files.length} images to web and mockups`);
  }
  
  // * Copy PNG icons
  const pngIcons = path.join(ICONS_DIR, 'png');
  if (fs.existsSync(pngIcons)) {
    const files = fs.readdirSync(pngIcons);
    files.forEach((file) => {
      const src = path.join(pngIcons, file);
      const dest = path.join(WEB_PUBLIC, 'icons', file);
      ensureDir(path.join(WEB_PUBLIC, 'icons'));
      fs.copyFileSync(src, dest);
    });
    console.log(`   ✅ Copied ${files.length} icons to web`);
  }
}

// * Main optimization pipeline
function optimizeAssets() {
  console.log('🚀 Starting asset optimization pipeline...');
  console.log('');
  
  // * Check for dependencies
  const hasImageMagick = checkDependencies();
  console.log('');
  
  // * Process images
  const sourceImages = path.join(IMAGES_DIR, 'source');
  if (fs.existsSync(sourceImages)) {
    console.log('📸 Processing images...');
    const images = fs.readdirSync(sourceImages).filter(f => 
      /\.(png|jpg|jpeg)$/i.test(f)
    );
    
    images.forEach((image) => {
      processImage(path.join(sourceImages, image), image);
    });
    console.log('');
  } else {
    console.log('ℹ️  No source images found. Place images in src/assets/images/source/');
    console.log('');
  }
  
  // * Process SVG icons
  const svgDir = path.join(ICONS_DIR, 'svg');
  if (fs.existsSync(svgDir)) {
    console.log('🎨 Processing icons...');
    const svgs = fs.readdirSync(svgDir).filter(f => /\.svg$/i.test(f));
    
    svgs.forEach((svg) => {
      const iconName = path.basename(svg, '.svg');
      processIcon(path.join(svgDir, svg), iconName);
    });
    console.log('');
  } else {
    console.log('ℹ️  No SVG icons found. Place icons in src/assets/icons/svg/');
    console.log('');
  }
  
  // * Copy to web/mockups
  copyWebAssets();
  console.log('');
  
  console.log('✨ Asset optimization complete!');
  
  // * Show instructions if ImageMagick is not installed
  if (!hasImageMagick) {
    console.log('');
    console.log('💡 Tip: Install ImageMagick for full optimization capabilities:');
    console.log('   Mac: brew install imagemagick');
    console.log('   Ubuntu/Debian: sudo apt-get install imagemagick');
    console.log('   Windows: Download from https://imagemagick.org');
  }
}

// * Run the optimization
optimizeAssets();