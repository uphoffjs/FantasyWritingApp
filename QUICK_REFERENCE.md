# Claude Code Quick Reference Card
> Essential commands and workflows for FantasyWritingApp development

## 🚀 The Most Important Commands

### The Golden Sequence™
```bash
/sc:save                          # Save config
write_memory("checkpoint", state) # Save context
/clear                           # Clear conversation
/sc:load                         # Reload config
read_memory("checkpoint")        # Restore context
```

## ⚡ Emergency Commands

| Situation | Command |
|-----------|---------|
| **Sluggish responses** | `/clear && /sc:load` |
| **Lost context** | `list_memories() && read_memory("checkpoint")` |
| **Before risky operation** | `/sc:save && write_memory("backup", state)` |
| **Session crash** | `/sc:load && read_memory("EOD")` |
| **Confused state** | `/clear && /sc:load` |

## 📝 Memory Operations

### Basic Memory Commands
```bash
write_memory(key, value)     # Save data
read_memory(key)            # Retrieve data
list_memories()             # Show all memories
delete_memory(key)          # Remove memory
```

### Memory Key Patterns
```bash
"checkpoint"           # Primary state
"checkpoint_30min"     # Time-based checkpoint
"feature_auth"         # Feature-specific
"context.module"       # Modular context
"temp_analysis"        # Temporary (delete later)
"decision_routing"     # Technical decisions
"EOD"                 # End of day summary
```

## 🔄 Session Workflows

### Start of Day
```bash
/sc:load
list_memories()
read_memory("EOD")
git status
npm run web
```

### Every 30 Minutes
```bash
write_memory("checkpoint_${time}", current_state)
```

### Task Complete
```bash
git commit -m "feat: description"
write_memory("task_done", what_was_completed)
```

### Before Break
```bash
write_memory("break", current_location)
/sc:save
```

### End of Day
```bash
write_memory("EOD", {
  completed: "what's done",
  tomorrow: "what's next"
})
/sc:save
delete_memory("temp_*")
/clear
```

## 🏃 Quick Patterns

### Pattern: Quick Context Switch
```bash
# Save current context
write_memory("ctx1", state) && /clear && /sc:load
# Load different context
read_memory("ctx2")
```

### Pattern: Debug Session
```bash
# Start debugging
write_memory("bug", issue) && git stash
# After finding fix
write_memory("fix", solution) && git stash pop
```

### Pattern: Feature Work
```bash
# Start feature
write_memory("feat", plan) && git checkout -b feature/name
# Complete feature
git commit -m "feat: done" && write_memory("feat_done", summary)
```

## 🎯 Project-Specific Commands

### FantasyWritingApp Development
```bash
npm run web             # Start dev server (port 3002)
npm run lint           # REQUIRED before commits
npm run cypress:open   # Open test UI
npm run cypress:run    # Run headless tests
npm run build:web      # Production build
```

### Git Workflow
```bash
git checkout -b feature/name  # Create feature branch
git status                    # Check changes
git add -A                    # Stage all changes
git commit -m "type: desc"    # Conventional commit
git push -u origin HEAD       # Push branch
```

## 🔍 Context Health Check

### Quick Assessment
```bash
# Check conversation health
response_speed      # Fast = Good, Slow = Clear needed
memory_count       # list_memories() | wc -l (>50 = cleanup)
session_duration   # >2 hours = refresh recommended
```

### Performance Indicators
| Indicator | Good 🟢 | Warning 🟡 | Critical 🔴 |
|-----------|---------|------------|-------------|
| Response | <3s | 3-5s | >5s |
| Context | <75% | 75-85% | >85% |
| Duration | <90min | 90-120min | >120min |
| Memories | <30 | 30-50 | >50 |

## 💾 Memory Templates

### Checkpoint Template
```javascript
{
  "task": "Current task description",
  "location": "file.js:45",
  "status": "in_progress|blocked|complete",
  "next": "Next action to take"
}
```

### EOD Template
```javascript
{
  "date": "2025-09-25",
  "completed": ["task1", "task2"],
  "in_progress": "current task",
  "blockers": ["issue1"],
  "tomorrow": "Start with X"
}
```

### Feature Template
```javascript
{
  "name": "Feature name",
  "progress": "30%",
  "done": ["part1"],
  "todo": ["part2", "part3"],
  "tests": "passing|failing"
}
```

## ⌨️ Recommended Aliases

Add to `~/.zshrc` or `~/.bashrc`:
```bash
# Claude Code helpers
alias cstart="/sc:load && list_memories()"
alias csave="write_memory('checkpoint', 'state') && /sc:save"
alias cclear="/clear && /sc:load"
alias ccheck="list_memories() | head -10"
alias ceod="write_memory('EOD', 'summary') && /sc:save && /clear"
```

## 🔧 Troubleshooting

| Problem | Quick Fix |
|---------|-----------|
| **Slow responses** | `cclear` |
| **Lost context** | `read_memory("checkpoint")` |
| **Memory errors** | `delete_memory("temp_*")` |
| **Confusion** | `/clear && /sc:load` |
| **Can't remember task** | `git status && git log -3` |

## 📊 Time Management

### Optimal Schedule
```
00:00 - Start session (/sc:load)
00:30 - Checkpoint 1
01:00 - Checkpoint 2
01:30 - Checkpoint 3 + Consider clear
02:00 - Clear & reload (mandatory)
```

### Warning Timeline
```
🟢 0-60min:   Optimal performance
🟡 60-90min:  Monitor closely
🟠 90-120min: Plan to clear
🔴 120min+:   Clear immediately
```

## 🎪 Advanced Tricks

### Trick 1: Lazy Context Loading
```bash
/sc:load                    # Load config only
# Work until you need context
read_memory("only_what_needed")  # Load on demand
```

### Trick 2: Context Sharding
```bash
write_memory("auth.backend", data1)
write_memory("auth.frontend", data2)
# Load only what you're working on
read_memory("auth.backend")
```

### Trick 3: Quick State Transfer
```bash
# One-liner state transfer
write_memory("qs", "line45") && /clear && /sc:load && read_memory("qs")
```

### Trick 4: Memory Cleanup
```bash
# Remove old checkpoints
list_memories() | grep checkpoint_ | head -n -3 | xargs -I {} delete_memory("{}")
```

## 📋 Cheat Sheets

### Session States
```
Fresh:     Just started/cleared (<30min)
Active:    Working normally (30-90min)
Loaded:    Getting heavy (90-120min)
Degraded:  Performance issues (>120min)
```

### Memory Lifecycle
```
Create:    write_memory()
Read:      read_memory()
Update:    write_memory() (overwrites)
Delete:    delete_memory()
```

### Context Layers
```
Layer 1:   Project config (permanent)
Layer 2:   Feature context (session)
Layer 3:   Task state (temporary)
```

## 🚦 Decision Flowchart

```
Feeling slow?
  → Yes: /clear && /sc:load
  → No: Continue

Been 90+ minutes?
  → Yes: Checkpoint & clear
  → No: Continue

Starting risky operation?
  → Yes: /sc:save first
  → No: Continue

Taking a break?
  → Yes: write_memory() state
  → No: Continue
```

## 📱 Mobile Reference

Quick commands for phone/tablet reference:

**Start**: `/sc:load`
**Save**: `write_memory("cp", s)`
**Clear**: `/clear`
**Reload**: `/sc:load`
**Check**: `list_memories()`
**Resume**: `read_memory("cp")`

---

*Print this page and keep it handy! 🖨️*

**Remember**: When in doubt → `/clear && /sc:load`