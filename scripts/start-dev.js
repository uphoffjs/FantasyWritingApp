#!/usr/bin/env node

/**
 * Development server starter with automatic port finding
 * Tries to find an available port starting from the specified port or 8080
 */

const { spawn } = require('child_process');
const net = require('net');

// Get port from command line arguments or environment variable
const requestedPort = process.argv[2] || process.env.PORT || 8080;
const fallbackPorts = [3000, 3001, 5000, 5173, 8000, 8080, 8081, 9000];

// Check if a port is available
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// Find an available port
async function findAvailablePort() {
  // First try the requested port
  if (await checkPort(requestedPort)) {
    return requestedPort;
  }
  
  console.log(`Port ${requestedPort} is busy, trying fallback ports...`);
  
  // Try fallback ports
  for (const port of fallbackPorts) {
    if (await checkPort(port)) {
      console.log(`Found available port: ${port}`);
      return port;
    }
  }
  
  // If all fallback ports are busy, try random ports
  console.log('All common ports are busy, finding a random available port...');
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(0, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

// Start the dev server
async function startDevServer() {
  try {
    const port = await findAvailablePort();
    
    console.log(`\n🚀 Starting Fantasy Element Builder on port ${port}...`);
    console.log(`📱 The app will open automatically in your browser\n`);
    
    // Set the PORT environment variable
    process.env.PORT = port;
    
    // Start webpack dev server
    const devServer = spawn('npm', ['run', 'web'], {
      stdio: 'inherit',
      env: { ...process.env, PORT: port },
      shell: true
    });
    
    devServer.on('error', (err) => {
      console.error('Failed to start dev server:', err);
      process.exit(1);
    });
    
    devServer.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Dev server exited with code ${code}`);
        process.exit(code);
      }
    });
    
  } catch (error) {
    console.error('Error starting dev server:', error);
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down dev server...');
  process.exit(0);
});

// Start the server
startDevServer();