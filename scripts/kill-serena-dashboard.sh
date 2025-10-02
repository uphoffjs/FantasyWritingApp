#!/bin/bash
# Kill Serena Dashboard Background Process
# This script continuously kills any process using port 24282 (Serena dashboard)

echo "🔪 Serena Dashboard Killer - Starting..."
echo "📍 Monitoring port 24282"
echo "⏹️  Press Ctrl+C to stop"
echo ""

# Kill any existing processes on port 24282 first
lsof -ti:24282 | xargs kill -9 2>/dev/null && echo "✅ Killed existing dashboard process"

# Continuously monitor and kill
while true; do
  PID=$(lsof -ti:24282 2>/dev/null)
  if [ ! -z "$PID" ]; then
    kill -9 $PID 2>/dev/null
    echo "⚡ Killed dashboard process (PID: $PID) at $(date +%H:%M:%S)"
  fi
  sleep 0.5
done
