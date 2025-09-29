# Port Configuration Guide

Fantasy Element Builder now supports running on multiple ports for flexibility during development.

## Quick Start

### Automatic Port Selection (Recommended)
```bash
npm run dev
```
This will automatically find an available port, starting with 8080, then trying common development ports (3000, 3001, 5000, 5173, 8000, 8081, 9000).

### Run on Specific Ports
```bash
# Run on port 3000
npm run dev:3000

# Run on port 5000
npm run dev:5000

# Run on port 8000
npm run dev:8000

# Run on port 8080 (default)
npm run dev:8080
```

### Environment Variable
You can also set the PORT environment variable:
```bash
# Using environment variable
PORT=4000 npm run web

# On Windows
set PORT=4000 && npm run web
```

### Custom Port via Command Line
```bash
# Run on any custom port
node scripts/start-dev.js 4200
```

## Features

- **Automatic Port Detection**: If your preferred port is busy, the app will automatically find an available one
- **Multiple Port Support**: The navigation system works with any port automatically
- **Network Access**: The dev server is configured to accept connections from any IP (useful for testing on mobile devices on the same network)
- **Browser Auto-Open**: The app will automatically open in your default browser when started

## Supported Ports

The app is pre-configured to work with these common development ports:
- 3000 (Create React App default)
- 3001 (Alternative CRA port)
- 5000 (Flask/Python default)
- 5173 (Vite default)
- 8000 (Django/Python default)
- 8080 (Traditional web server)
- 8081 (Alternative)
- 9000 (PHP/other frameworks)

## Accessing from Other Devices

When the server starts, you can access it from other devices on your network:
1. Find your computer's IP address
2. Access the app at `http://[YOUR-IP]:[PORT]`

Example: `http://192.168.1.100:8080`

## Troubleshooting

### Port Already in Use
If you see "Port X is already in use", the app will automatically try other ports. You can also:
1. Stop the process using that port
2. Choose a different port manually
3. Let the auto-detection find an available port

### Finding What's Using a Port
```bash
# On macOS/Linux
lsof -i :8080

# On Windows
netstat -ano | findstr :8080
```

### Killing a Process on a Port
```bash
# On macOS/Linux
kill -9 $(lsof -t -i:8080)

# On Windows (in Administrator mode)
# First find the PID from netstat, then:
taskkill /PID [PID_NUMBER] /F
```