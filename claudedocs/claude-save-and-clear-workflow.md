# Claude Save & Clear Workflow
> Quick reference for saving context and clearing conversations

## 🆕 NEW: Built-in Memory System Available!

The Fantasy Writing App now has a comprehensive memory system built-in. You can use the new memory store alongside the traditional workflow.

### ⚠️ IMPORTANT: Memory System Must Run Inside React App

The `memoryHelpers` functions **ONLY work inside your running React Native app**, not from the command line. You need to add them to a component.

### Three Ways to Use the Memory System

#### Option 1: Quick Dev Tools (Recommended)
Add the floating dev tools to your App.tsx:

```tsx
// In App.tsx
import { DevMemoryTools } from './src/components/DevMemoryTools';

// Add at the bottom of your App component
return (
  <View>
    {/* Your existing app */}
    <DevMemoryTools /> {/* Floating buttons for checkpoints */}
  </View>
);
```

This gives you buttons for:
- 📸 Create checkpoint
- 📊 View summary
- 📈 Show progress
- 📋 List checkpoints

#### Option 2: Full Dashboard
```tsx
import { MemoryDashboard } from './src/components/MemoryDashboard';

// Add to any screen
<MemoryDashboard />
```

#### Option 3: Custom Integration
```tsx
// In any component
import { memoryHelpers } from './src/store/memoryStore';

const MyComponent = () => {
  const handleSaveCheckpoint = () => {
    const checkpointId = memoryHelpers.checkpoint("Session checkpoint");
    console.log('Checkpoint saved:', checkpointId);
  };

  return (
    <Button title="Save Checkpoint" onPress={handleSaveCheckpoint} />
  );
};
```

## 🚀 Quick Command Sequence

### Traditional Method - Step by Step

**Step 1: Save Claude's configuration**
```bash
/sc:save
```

**Step 2: Save your current context**
```bash
write_memory("checkpoint", "current context and state")
```

**Step 3: Clear the conversation**
```bash
/clear
```

**Step 4: Reload Claude's configuration**
```bash
/sc:load but do not start any work yet
```

**Step 5: Restore your context**
```bash
read_memory("checkpoint") but do not start any work yet
```

### Load Specific Documentation

**Load important cypress project docs at once:**
```bash
/sc:load @/Users/jacobuphoff/Desktop/FantasyWritingApp/CLAUDE.md @/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/docs/cypress-best-practices.md @cypress/docs/ADVANCED-TESTING-STRATEGY.md @/Users/jacobuphoff/Desktop/FantasyWritingApp/CLAUDE.md but do not start any work yet
```

**Or load individually:**

Cypress Best Practices:
```bash
/sc:load @/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/docs/cypress-best-practices.md
```

Advanced Testing Strategy:
```bash
/sc:load @cypress/docs/ADVANCED-TESTING-STRATEGY.md
```

Project CLAUDE.md:
```bash
/sc:load @/Users/jacobuphoff/Desktop/FantasyWritingApp/CLAUDE.md but do not start any work yet
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

**Save configuration:**
```bash
/sc:save
```

**Document current task:**
```bash
write_memory("current_task", "Implementing password reset in auth.js")
```

**Save current file location:**
```bash
write_memory("last_file", "src/auth/resetPassword.js line 45")
```

**Save next step:**
```bash
write_memory("next_step", "Add email template for reset link")
```

### Step 3: Save Important Context

**Save checkpoint with key decisions:**
```bash
write_memory("checkpoint", {
  "working_on": "Password reset feature",
  "completed": ["API endpoint", "database schema"],
  "in_progress": "Email integration",
  "blocked_by": "Need SMTP credentials",
  "key_decisions": "Using Redis for reset tokens with 1hr expiry",
  "testing_notes": "Need to mock email service in tests"
})
```

**Save project-specific context:**
```bash
write_memory("project_context", {
  "uses": "pnpm not npm",
  "framework": "Next.js 14 with App Router",
  "auth": "JWT with refresh tokens",
  "testing": "Vitest + Playwright"
})
```

### Step 4: Save Technical Decisions (if any)

**Save technical decisions:**
```bash
write_memory("technical_decisions", {
  "why_redis": "Faster than DB for temporary tokens",
  "token_expiry": "1 hour for security",
  "email_service": "Using SendGrid for reliability"
})
```

### Step 5: Update Todo List (if using)

**Save todo status:**
```bash
write_memory("todo_status", "3 of 5 tasks completed, working on #4")
```

### Step 6: Clear the Conversation

**Clear conversation:**
```bash
/clear
```

> You'll see: "Conversation cleared. Starting fresh!"
> Permissions are retained ✅
> Context is gone (but saved in memory) ✅

### Step 7: Reload Configuration

**Reload Claude configuration:**
```bash
/sc:load
```

> This reloads:
> - Global ~/.claude/CLAUDE.md and all related files
> - Project-specific CLAUDE.md if it exists
> - All your custom rules and settings

### Step 8: Restore Your Context

**Check saved memories:**
```bash
list_memories()
```

**Restore checkpoint:**
```bash
read_memory("checkpoint")
```

**Restore current task:**
```bash
read_memory("current_task")
```

**Restore technical decisions (if needed):**
```bash
read_memory("technical_decisions")
```

### Step 9: Verify and Continue

**Verify understanding:**
```text
"Based on memory, I was working on [X] and need to continue with [Y], correct?"
```

**Check todo list (if using):**
```text
"Show me the current todo list"
```

> Continue working exactly where you left off!

## 🎯 Optimized Quick Version

### For Quick Context Switches (< 2 min break)

**Step 1: Save quick checkpoint:**
```bash
write_memory("quick_checkpoint", "Working on auth.js line 45, implementing reset")
```

**Step 2: Clear conversation:**
```bash
/clear
```

**Step 3: Reload configuration:**
```bash
/sc:load
```

**Step 4: Restore checkpoint:**
```bash
read_memory("quick_checkpoint")
```

> Continue immediately after restoring

### For End of Day

**Step 1: Save configuration:**
```bash
/sc:save
```

**Step 2: Save end-of-day summary:**
```bash
write_memory("EOD", {
  "completed_today": "Login, logout, JWT implementation",
  "tomorrow_start": "Password reset email templates",
  "blockers": "Need SMTP credentials from DevOps"
})
```

**Step 3: Save open files:**
```bash
write_memory("open_files", "auth.js, resetPassword.js, email.service.js")
```

**Step 4: Clear conversation:**
```bash
/clear
```

> Close Claude Code after clearing

### For Starting Next Day

**Step 1: Load configuration:**
```bash
/sc:load
```

**Step 2: Check saved memories:**
```bash
list_memories()
```

**Step 3: Read end-of-day summary:**
```bash
read_memory("EOD")
```

**Step 4: Read open files:**
```bash
read_memory("open_files")
```

**Step 5: Continue where you left off:**
```text
"Continue with password reset email templates"
```

## 💡 What to Save in Memory

### Always Save

**Checkpoint:**
```bash
write_memory("checkpoint", "Current state and context")
```

**Current task:**
```bash
write_memory("current_task", "What you're working on")
```

**Next step:**
```bash
write_memory("next_step", "What to do after reload")
```

### Save When Relevant

**Technical decisions:**
```bash
write_memory("technical_decisions", "Important choices made")
```

**Blockers:**
```bash
write_memory("blockers", "What's preventing progress")
```

**Tested approaches:**
```bash
write_memory("tested_approaches", "What didn't work and why")
```

**Project quirks:**
```bash
write_memory("project_quirks", "Unusual project-specific things")
```

**Key findings:**
```bash
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

**Step 1: Save configuration:**
```bash
/sc:save
```

**Step 2: Save progress:**
```bash
write_memory("feature_progress", "Login done, working on password reset line 45")
```

**Step 3: Clear:**
```bash
/clear
```

**Step 4: Reload:**
```bash
/sc:load
```

**Step 5: Restore progress:**
```bash
read_memory("feature_progress")
```

> Continue from line 45

### Scenario 2: After Complex Analysis

**Step 1: Save configuration:**
```bash
/sc:save
```

**Step 2: Save findings:**
```bash
write_memory("analysis_findings", "Performance bottleneck in API calls, need caching")
```

**Step 3: Save solution:**
```bash
write_memory("proposed_solution", "Implement Redis caching layer")
```

**Step 4: Clear:**
```bash
/clear
```

**Step 5: Reload:**
```bash
/sc:load
```

**Step 6: Restore findings:**
```bash
read_memory("analysis_findings")
```

**Step 7: Restore solution:**
```bash
read_memory("proposed_solution")
```

> Begin implementation

### Scenario 3: Before Lunch Break

**Step 1: Save configuration:**
```bash
/sc:save
```

**Step 2: Save current work:**
```bash
write_memory("lunch_break", "Debugging test failure in auth.test.js line 234")
```

**Step 3: Clear:**
```bash
/clear
```

> Go to lunch

**Step 4: After return, reload:**
```bash
/sc:load
```

**Step 5: Restore context:**
```bash
read_memory("lunch_break")
```

> Resume debugging at line 234

### Scenario 4: Complex Multi-Day Feature

#### Day 1 End

**Step 1: Save configuration:**
```bash
/sc:save
```

**Step 2: Save day 1 progress:**
```bash
write_memory("feature_day1", "Completed backend API, 70% done")
```

**Step 3: Save day 2 plan:**
```bash
write_memory("feature_day2_plan", "Frontend integration and testing")
```

**Step 4: Clear:**
```bash
/clear
```

#### Day 2 Start

**Step 1: Load configuration:**
```bash
/sc:load
```

**Step 2: Read day 1 progress:**
```bash
read_memory("feature_day1")
```

**Step 3: Read day 2 plan:**
```bash
read_memory("feature_day2_plan")
```

> Continue with frontend

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

> This is the sequence you'll use 90% of the time:

**Step 1: Save configuration:**
```bash
/sc:save
```

**Step 2: Save checkpoint:**
```bash
write_memory("checkpoint", "Current context here")
```

**Step 3: Clear conversation:**
```bash
/clear
```

**Step 4: Reload configuration:**
```bash
/sc:load
```

**Step 5: Restore checkpoint:**
```bash
read_memory("checkpoint")
```

> That's it! You're back where you were with fresh context.

## 🎮 New Memory System Integration

### Memory Dashboard Component
The app now includes a `MemoryDashboard` component you can add to any screen:

```tsx
import { MemoryDashboard } from './src/components/MemoryDashboard';

// Add to any screen or as a dev tool
<MemoryDashboard />
```

### Programmatic Memory Management
Use the memory system in your development workflow:

```typescript
import { useMemoryStore } from './src/store/memoryStore';
import { memoryHelpers } from './src/store/memoryStore';

// Start a coding session
const store = useMemoryStore.getState();
store.startSession(['Fix auth bug', 'Add tests']);

// Track progress
store.addTask({
  content: 'Fix login validation',
  status: 'in_progress',
  priority: 'high'
});

// Record decisions
store.addDecision(
  'Using JWT instead of sessions',
  'Better for mobile app compatibility'
);

// Create checkpoint before risky changes
const checkpointId = store.createCheckpoint(
  'Before refactoring auth',
  'Saving stable state before major changes'
);

// If something goes wrong, restore
store.restoreCheckpoint(checkpointId);

// End session with summary
store.endSession(['Continue with password reset tomorrow']);
console.log(store.generateSummary());
```

### Memory System Files
- **Store**: `/src/store/memoryStore.ts` - Core memory functionality
- **Hooks**: `/src/hooks/useMemory.ts` - React hooks for components
- **Dashboard**: `/src/components/MemoryDashboard.tsx` - Full visual interface
- **Dev Tools**: `/src/components/DevMemoryTools.tsx` - Quick floating buttons (RECOMMENDED)
- **Examples**: `/src/examples/MemorySystemExample.tsx` - Usage patterns

### Auto-Checkpoint Feature
The system automatically creates checkpoints every 30 minutes. You can configure this:

```typescript
const store = useMemoryStore.getState();
store.autoCheckpoint = true; // Enable/disable
store.checkpointInterval = 30; // Minutes
store.maxCheckpoints = 10; // Keep last 10 checkpoints
```

### Export/Import Checkpoints
Save your work externally:

```typescript
// Export checkpoint to file (browser only)
const checkpoints = useCheckpoints();
checkpoints.export(checkpointId); // Downloads as JSON

// Import from file
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', (e) => {
  checkpoints.import(e.target.files[0]);
});
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