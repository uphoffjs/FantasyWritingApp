# Claude Save & Clear Workflow
> Quick reference for saving context and clearing conversations

## 🚀 Quick Command Sequence

```bash
# The Essential 5-Step Flow
1. /sc:save
2. write_memory("checkpoint", "current context and state")
3. /clear
4. /sc:load but do not start to work on anything yet
5. read_memory("checkpoint")
```

## 📋 Detailed Step-by-Step Workflow

### Step 1: Pre-Clear Assessment
```bash
# Ask yourself:
- Am I at a natural breaking point?
- Have I completed a task or feature?
- Has it been 90+ minutes?
- Is the conversation feeling sluggish?

# If YES to any → Proceed to Step 2
```

### Step 2: Save Current State
```bash
# Save configuration and context
/sc:save

# Document what you're working on
write_memory("current_task", "Implementing password reset in auth.js")
write_memory("last_file", "src/auth/resetPassword.js line 45")
write_memory("next_step", "Add email template for reset link")
```

### Step 3: Save Important Context
```bash
# Save key decisions and understanding
write_memory("checkpoint", {
  "working_on": "Password reset feature",
  "completed": ["API endpoint", "database schema"],
  "in_progress": "Email integration",
  "blocked_by": "Need SMTP credentials",
  "key_decisions": "Using Redis for reset tokens with 1hr expiry",
  "testing_notes": "Need to mock email service in tests"
})

# Save any project-specific context
write_memory("project_context", {
  "uses": "pnpm not npm",
  "framework": "Next.js 14 with App Router",
  "auth": "JWT with refresh tokens",
  "testing": "Vitest + Playwright"
})
```

### Step 4: Save Technical Decisions (if any)
```bash
# If you made important technical decisions
write_memory("technical_decisions", {
  "why_redis": "Faster than DB for temporary tokens",
  "token_expiry": "1 hour for security",
  "email_service": "Using SendGrid for reliability"
})
```

### Step 5: Update Todo List (if using)
```bash
# If you have active todos, they'll persist visually
# But save the status for clarity
write_memory("todo_status", "3 of 5 tasks completed, working on #4")
```

### Step 6: Clear the Conversation
```bash
/clear

# You'll see: "Conversation cleared. Starting fresh!"
# Permissions are retained ✅
# Context is gone (but saved in memory) ✅
```

### Step 7: Reload Configuration
```bash
# Immediately reload your Claude configuration
/sc:load

# This reloads:
# - Global ~/.claude/CLAUDE.md and all related files
# - Project-specific CLAUDE.md if it exists
# - All your custom rules and settings
```

### Step 8: Restore Your Context
```bash
# Check what's saved
list_memories()

# Restore your checkpoint
read_memory("checkpoint")

# Restore specific context as needed
read_memory("current_task")
read_memory("technical_decisions")
```

### Step 9: Verify and Continue
```bash
# Verify understanding
"Based on memory, I was working on [X] and need to continue with [Y], correct?"

# Check todos if using
"Show me the current todo list"

# Continue working exactly where you left off!
```

## 🎯 Optimized Quick Version

### For Quick Context Switches (< 2 min break)
```bash
write_memory("quick_checkpoint", "Working on auth.js line 45, implementing reset")
/clear
/sc:load
read_memory("quick_checkpoint")
# Continue immediately
```

### For End of Day
```bash
/sc:save
write_memory("EOD", {
  "completed_today": "Login, logout, JWT implementation",
  "tomorrow_start": "Password reset email templates",
  "blockers": "Need SMTP credentials from DevOps"
})
write_memory("open_files", "auth.js, resetPassword.js, email.service.js")
/clear
# Close Claude Code
```

### For Starting Next Day
```bash
/sc:load
list_memories()
read_memory("EOD")
read_memory("open_files")
# "Continue with password reset email templates"
```

## 💡 What to Save in Memory

### Always Save
```bash
write_memory("checkpoint", "Current state and context")
write_memory("current_task", "What you're working on")
write_memory("next_step", "What to do after reload")
```

### Save When Relevant
```bash
write_memory("technical_decisions", "Important choices made")
write_memory("blockers", "What's preventing progress")
write_memory("tested_approaches", "What didn't work and why")
write_memory("project_quirks", "Unusual project-specific things")
write_memory("key_findings", "Important discoveries from analysis")
```

### Project-Level (Save Once)
```bash
write_memory("project_setup", {
  "package_manager": "pnpm",
  "test_command": "pnpm test",
  "lint_command": "pnpm lint",
  "dev_server": "pnpm dev",
  "special_rules": "Always use data-cy for test selectors"
})
```

## ⚡ Common Scenarios

### Scenario 1: Mid-Feature Clear
```bash
/sc:save
write_memory("feature_progress", "Login done, working on password reset line 45")
/clear
/sc:load
read_memory("feature_progress")
# Continue from line 45
```

### Scenario 2: After Complex Analysis
```bash
/sc:save
write_memory("analysis_findings", "Performance bottleneck in API calls, need caching")
write_memory("proposed_solution", "Implement Redis caching layer")
/clear
/sc:load
read_memory("analysis_findings")
read_memory("proposed_solution")
# Begin implementation
```

### Scenario 3: Before Lunch Break
```bash
/sc:save
write_memory("lunch_break", "Debugging test failure in auth.test.js line 234")
/clear
# Go to lunch
# Come back
/sc:load
read_memory("lunch_break")
# Resume debugging at line 234
```

### Scenario 4: Complex Multi-Day Feature
```bash
# Day 1 End
/sc:save
write_memory("feature_day1", "Completed backend API, 70% done")
write_memory("feature_day2_plan", "Frontend integration and testing")
/clear

# Day 2 Start
/sc:load
read_memory("feature_day1")
read_memory("feature_day2_plan")
# Continue with frontend
```

## ⚠️ Important Reminders

### DO ✅
- Save BEFORE you need to (proactive > reactive)
- Use descriptive memory keys
- Save "why" not just "what"
- Check memories after reload to verify
- Clear at natural breakpoints

### DON'T ❌
- Wait until conversation is sluggish
- Clear without saving context
- Forget to /sc:load after clearing
- Use vague memory keys like "stuff" or "temp"
- Clear in the middle of complex operations

## 🔥 The Golden Sequence

```bash
# This is the sequence you'll use 90% of the time:
/sc:save
write_memory("checkpoint", "Current context here")
/clear
/sc:load  
read_memory("checkpoint")

# That's it! You're back where you were with fresh context.
```

## 📊 When to Use This Workflow

| Situation | Action |
|-----------|---------|
| Every 90 minutes | Use the workflow |
| Task completed | Use the workflow |
| Before break | Use the workflow |
| Switching features | Use the workflow |
| Conversation sluggish | Use the workflow IMMEDIATELY |
| End of day | Use the workflow with detailed memory |
| Before complex operation | Use the workflow |
| After complex operation | Use the workflow |

## 🎯 Quick Terminal Alias (Optional)

Add to your `~/.zshrc` or `~/.bashrc`:
```bash
alias claude-clear="echo 'Remember: /sc:save → write_memory → /clear → /sc:load → read_memory'"
```

---

*Keep this guide handy for optimal conversation management. The key is being proactive - clear before you're forced to!*