// Debug script to test the create project functionality
// This will help isolate if the issue is in the UI or the store

const puppeteer = require('puppeteer');

async function testCreateProject() {
  console.log('Starting browser...');
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor'] 
  });
  
  const page = await browser.newPage();
  
  // Listen for console messages from the page
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'log' || type === 'error' || type === 'warn') {
      console.log(`[BROWSER ${type.toUpperCase()}]`, msg.text());
    }
  });
  
  // Listen for JavaScript errors
  page.on('pageerror', err => {
    console.error('[BROWSER ERROR]', err.message);
  });
  
  try {
    console.log('Navigating to http://localhost:3002...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });
    
    console.log('Waiting for page to load...');
    await page.waitForTimeout(2000);
    
    console.log('Looking for the New Project button...');
    const newProjectButton = await page.$('[data-cy="new-project-button"]');
    
    if (!newProjectButton) {
      console.error('New Project button not found!');
      return;
    }
    
    console.log('Clicking New Project button...');
    await newProjectButton.click();
    
    console.log('Waiting for modal to appear...');
    await page.waitForTimeout(1000);
    
    console.log('Looking for project name input...');
    const nameInput = await page.$('[data-cy="project-name-input"]');
    
    if (!nameInput) {
      console.error('Project name input not found!');
      return;
    }
    
    console.log('Typing project name...');
    await nameInput.type('Debug Test Project');
    
    console.log('Looking for description input...');
    const descInput = await page.$('[data-cy="project-description-input"]');
    
    if (descInput) {
      console.log('Typing project description...');
      await descInput.type('This is a test project created by the debug script');
    }
    
    console.log('Looking for Create button...');
    const createButton = await page.$('[data-cy="create-project-button"]');
    
    if (!createButton) {
      console.error('Create button not found!');
      return;
    }
    
    console.log('Clicking Create button...');
    await createButton.click();
    
    console.log('Waiting for project creation...');
    await page.waitForTimeout(3000);
    
    console.log('Checking if project was created...');
    const projects = await page.$$eval('[data-cy="delete-project-button"]', buttons => buttons.length);
    console.log(`Found ${projects} projects in the list`);
    
    if (projects > 0) {
      console.log('✅ Project creation appears to have worked!');
    } else {
      console.error('❌ No projects found - creation may have failed');
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    console.log('Keeping browser open for manual inspection...');
    console.log('Check the browser console for debug messages');
    console.log('Press Ctrl+C to close when done');
    
    // Keep the script running
    await new Promise(() => {});
  }
}

// Check if puppeteer is available
try {
  testCreateProject().catch(console.error);
} catch (error) {
  console.log('Puppeteer not available. Please test manually:');
  console.log('1. Open http://localhost:3002 in your browser');
  console.log('2. Open browser Developer Tools (F12)');
  console.log('3. Click the "New Project" button');
  console.log('4. Fill in project name and click Create');
  console.log('5. Check the Console tab for debug messages');
  console.log('6. Look for any error messages or failed network requests');
}