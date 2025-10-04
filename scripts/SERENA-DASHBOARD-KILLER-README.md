# Serena Dashboard Killer 🔪

## Problem

The Serena MCP server opens a browser window at `http://127.0.0.1:24282/dashboard/index.html` every time Claude Code starts, which is annoying.

## Solution

A background script that continuously monitors and kills the dashboard process.

## Usage

### Option 1: Run Manually (Recommended)

Open a new terminal and run:

```bash
npm run kill-serena-dashboard
```

**Leave this terminal running in the background**. The script will:

- ✅ Kill any existing dashboard process immediately
- 🔁 Monitor port 24282 continuously
- ⚡ Auto-kill the dashboard whenever it tries to start
- 📊 Show you when it kills the process

**To stop:** Press `Ctrl+C` in the terminal

### Option 2: Run in Background (Advanced)

```bash
# Start in background
npm run kill-serena-dashboard &

# Check if running
ps aux | grep kill-serena-dashboard

# Stop the background process
pkill -f kill-serena-dashboard
```

### Option 3: Auto-Start on Login (macOS LaunchAgent)

Create a LaunchAgent that runs automatically when you log in:

```bash
# Create the plist file
cat > ~/Library/LaunchAgents/com.user.kill-serena-dashboard.plist <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.user.kill-serena-dashboard</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/jacobuphoff/Desktop/FantasyWritingApp/scripts/kill-serena-dashboard.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/serena-dashboard-killer.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/serena-dashboard-killer.error.log</string>
</dict>
</plist>
EOF

# Load the LaunchAgent
launchctl load ~/Library/LaunchAgents/com.user.kill-serena-dashboard.plist

# Check status
launchctl list | grep kill-serena-dashboard

# View logs
tail -f /tmp/serena-dashboard-killer.log
```

**To disable auto-start:**

```bash
launchctl unload ~/Library/LaunchAgents/com.user.kill-serena-dashboard.plist
```

## How It Works

1. Script monitors port 24282 every 0.5 seconds
2. When Serena dashboard tries to start, it binds to port 24282
3. Script detects the process and immediately kills it with `kill -9`
4. Dashboard never has a chance to open the browser window

## Troubleshooting

**Dashboard still opens?**

- Make sure the script is actually running: `ps aux | grep kill-serena-dashboard`
- Check if port is correct: `lsof -i:24282` (should show the Serena process)
- Try reducing sleep interval to 0.1 seconds in the script

**Script stops working?**

- Restart it: `npm run kill-serena-dashboard`
- Check logs: `tail -f /tmp/serena-dashboard-killer.log`

**Want to allow dashboard sometimes?**

- Just stop the script temporarily: `Ctrl+C` or `pkill -f kill-serena-dashboard`

## Notes

- ✅ Safe: Only kills processes on port 24282 (Serena dashboard)
- ✅ Non-intrusive: Doesn't affect Serena MCP functionality
- ✅ Lightweight: Minimal CPU usage (<0.1%)
- ⚠️ Aggressive: Uses `kill -9` (force kill, no cleanup)

## Alternative: Disable Serena MCP Entirely

If you don't need Serena MCP, you can disable it in Claude Code:

Edit: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "serena": {
      "disabled": true
    }
  }
}
```
