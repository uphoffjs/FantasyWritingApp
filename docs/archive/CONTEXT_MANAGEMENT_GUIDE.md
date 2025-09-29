# Context Management Guide for FantasyWritingApp
> Comprehensive guide for managing Claude Code context, memory, and sessions

## 📚 Table of Contents
1. [Core Concepts](#core-concepts)
2. [Memory Management](#memory-management)
3. [Session Lifecycle](#session-lifecycle)
4. [Context Preservation Strategies](#context-preservation-strategies)
5. [Performance Optimization](#performance-optimization)
6. [Troubleshooting](#troubleshooting)
7. [Quick Reference](#quick-reference)

## Core Concepts

### Understanding Context in Claude Code
Context represents the accumulated knowledge and state within a Claude Code conversation:
- **Working Memory**: Current task state, file contents, recent operations
- **Project Understanding**: Code structure, dependencies, patterns
- **Session State**: Open files, terminal state, active processes
- **Decision History**: Technical choices, implementation rationale

### When Context Becomes Critical
| Indicator | Impact | Action Required |
|-----------|--------|-----------------|
| 75%+ usage | Slower responses | Consider clearing non-essential context |
| 85%+ usage | Performance degradation | Clear and reload immediately |
| 90%+ usage | Risk of truncation | Emergency clear required |
| Multiple features | Context fragmentation | Checkpoint and segment work |
| 2+ hour sessions | Context decay | Proactive refresh recommended |

## Memory Management

### Memory Types and Usage

#### 1. Checkpoint Memory
```bash
# Primary state preservation
write_memory("checkpoint", {
  "task": "Current implementation",
  "status": "What's completed",
  "next": "Next steps",
  "blockers": "Any impediments"
})
```

#### 2. Technical Decision Memory
```bash
# Preserve architectural choices
write_memory("decisions", {
  "architecture": "Chosen patterns and why",
  "libraries": "Selected dependencies",
  "trade_offs": "Accepted compromises",
  "rejected": "What didn't work and why"
})
```

#### 3. Project-Specific Memory
```bash
# One-time project setup
write_memory("project_config", {
  "commands": {
    "dev": "npm run web",
    "test": "npm run cypress:open",
    "lint": "npm run lint"
  },
  "ports": {
    "web": 3002,
    "api": 3001
  },
  "quirks": "Project-specific behaviors"
})
```

#### 4. Session Progress Memory
```bash
# Track multi-session features
write_memory("feature_progress", {
  "feature": "Authentication System",
  "completed": ["login", "logout", "session management"],
  "in_progress": "password reset",
  "remaining": ["2FA", "social auth"],
  "test_coverage": "85%"
})
```

### Memory Best Practices

#### DO ✅
- **Hierarchical Keys**: Use structured naming like `auth.login.status`
- **Timestamp Critical Data**: Include timestamps for time-sensitive information
- **JSON Structure**: Use JSON for complex data to maintain structure
- **Regular Cleanup**: Delete obsolete memories with `delete_memory()`
- **Descriptive Names**: Use clear, searchable key names

#### DON'T ❌
- **Overwrite Carelessly**: Check existing memories before writing
- **Store Sensitive Data**: Never store passwords, tokens, or keys
- **Use Generic Keys**: Avoid "temp", "data", "stuff"
- **Forget to Clean Up**: Remove temporary memories after use
- **Store Large Data**: Keep memories concise and focused

## Session Lifecycle

### Session Initialization
```bash
# Start of session
/sc:load                           # Load configurations
list_memories()                    # Check available context
read_memory("checkpoint")          # Restore last state
read_memory("feature_progress")    # Understand current work
```

### Active Session Management

#### Every 30 Minutes
```bash
write_memory("checkpoint_30min", {
  "time": new Date().toISOString(),
  "current_file": "Active file and line",
  "task_status": "Current task progress"
})
```

#### Task Completion
```bash
write_memory("task_complete", {
  "task": "Task description",
  "changes": ["List of modified files"],
  "tests": "Test results",
  "next_task": "What comes next"
})
```

#### Before Complex Operations
```bash
/sc:save
write_memory("pre_operation", {
  "operation": "What you're about to do",
  "rollback": "How to undo if needed",
  "state": "Current working state"
})
```

### Session Termination
```bash
# End of session cleanup
write_memory("session_end", {
  "date": new Date().toISOString(),
  "completed": "What was finished",
  "in_progress": "What's partially done",
  "next_session": "Where to start next time"
})
/sc:save
delete_memory("temp_*")  # Clean temporary memories
```

## Context Preservation Strategies

### Strategy 1: Incremental Checkpointing
Best for: Long-running features, complex implementations

```bash
# After each subtask
write_memory(`subtask_${index}`, {
  "completed": true,
  "changes": "What changed",
  "learned": "Key insights"
})

# Consolidate periodically
write_memory("feature_summary", {
  "subtasks_done": [1, 2, 3],
  "current_subtask": 4,
  "total_subtasks": 8
})
```

### Strategy 2: Contextual Segmentation
Best for: Multi-feature work, parallel development

```bash
# Segment by feature
write_memory("context.auth", authContext)
write_memory("context.ui", uiContext)
write_memory("context.api", apiContext)

# Switch contexts
read_memory("context.auth")  # Focus on auth work
```

### Strategy 3: Recovery Points
Best for: Risky operations, experimental changes

```bash
# Before risky operation
git commit -m "checkpoint: before major refactor"
write_memory("recovery_point", {
  "commit": "git rev-parse HEAD",
  "state": "Working state description"
})

# If things go wrong
git reset --hard [commit]
read_memory("recovery_point")
```

### Strategy 4: Progressive Enhancement
Best for: Iterative development, quality improvements

```bash
write_memory("enhancement_cycle", {
  "iteration": 1,
  "baseline": "Current quality metrics",
  "target": "Desired improvements",
  "applied": ["optimization1", "optimization2"]
})
```

## Performance Optimization

### Context Usage Patterns

#### Optimal Pattern
```
Load (5%) → Work (70%) → Peak (75%) → Clear → Reload (5%)
```

#### Warning Pattern
```
Load (5%) → Work (70%) → Peak (85%) → Struggle (90%) → Forced Clear
```

### Optimization Techniques

#### 1. Selective Context Loading
```bash
# Instead of loading everything
/sc:load
list_memories()
# Load only what's needed
read_memory("checkpoint")
read_memory("current_feature")
# Skip historical data until needed
```

#### 2. Context Pruning
```bash
# Regular cleanup
delete_memory("old_checkpoint_*")
delete_memory("temp_*")
delete_memory("debug_*")

# Keep only recent checkpoints
list_memories() | grep checkpoint | tail -3
```

#### 3. Efficient Memory Structure
```bash
# Bad: Multiple small memories
write_memory("file1", "content1")
write_memory("file2", "content2")
write_memory("file3", "content3")

# Good: Consolidated memory
write_memory("working_files", {
  "file1": "content1",
  "file2": "content2",
  "file3": "content3"
})
```

#### 4. Lazy Loading Strategy
```bash
# Store references, not content
write_memory("large_analysis", {
  "summary": "Key findings only",
  "details_location": "docs/full_analysis.md"
})
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Context feels sluggish"
**Solution:**
```bash
# Immediate action
/sc:save
write_memory("quick_state", "Current task and line")
/clear
/sc:load
read_memory("quick_state")
```

#### Issue: "Lost track of what I was doing"
**Solution:**
```bash
list_memories() | grep checkpoint
read_memory("checkpoint")
read_memory("feature_progress")
git status  # Check file changes
git log -3 --oneline  # Recent commits
```

#### Issue: "Memory conflicts"
**Solution:**
```bash
# Check for duplicates
list_memories() | sort | uniq -d

# Consolidate memories
read_memory("old_checkpoint")
read_memory("new_checkpoint")
write_memory("consolidated_checkpoint", merged_data)
delete_memory("old_checkpoint")
```

#### Issue: "Can't remember project specifics"
**Solution:**
```bash
# Rebuild project context
read_memory("project_config")
cat CLAUDE.md | head -50  # Review project rules
ls -la  # Check project structure
npm run  # See available scripts
```

## Quick Reference

### Essential Commands
| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/sc:save` | Save configuration | Before clearing, end of session |
| `/sc:load` | Load configuration | Start of session, after clear |
| `/clear` | Clear conversation | Every 90 min, when sluggish |
| `write_memory()` | Save context | Task completion, checkpoints |
| `read_memory()` | Restore context | After clear, session start |
| `list_memories()` | View saved context | Debugging, context check |
| `delete_memory()` | Remove old context | Cleanup, conflicts |

### Context Health Indicators
| Status | Indicator | Action |
|--------|-----------|--------|
| 🟢 Healthy | <75% usage, responsive | Continue working |
| 🟡 Warning | 75-85% usage, slight lag | Plan to clear soon |
| 🔴 Critical | >85% usage, noticeable lag | Clear immediately |
| ⚫ Degraded | Errors, truncation | Emergency clear required |

### Memory Naming Convention
```
checkpoint          # Primary state
checkpoint_[time]   # Timestamped checkpoints
feature_[name]      # Feature-specific context
context.[domain]    # Segmented contexts
temp_[purpose]      # Temporary data (delete later)
decision_[topic]    # Technical decisions
config_[type]       # Configuration data
```

### Quick Workflow Templates

#### Template 1: Feature Development
```bash
# Start
/sc:load && read_memory("feature_auth")

# Work
# ... development ...

# Checkpoint
write_memory("feature_auth", updated_state)

# End
/sc:save && write_memory("EOD", summary)
```

#### Template 2: Debugging Session
```bash
# Start
/sc:load && read_memory("debug_issue_123")

# Investigation
# ... debugging ...

# Finding
write_memory("debug_finding", root_cause)

# Clear for fresh perspective
/clear && /sc:load && read_memory("debug_finding")
```

#### Template 3: Code Review
```bash
# Start
/sc:load && git status

# Review
# ... code review ...

# Checkpoint findings
write_memory("review_feedback", issues_found)

# Clear before fixes
/clear && /sc:load && read_memory("review_feedback")
```

## Advanced Patterns

### Pattern: Distributed Context
For large projects with multiple modules:
```bash
write_memory("module.auth", auth_context)
write_memory("module.api", api_context)
write_memory("module.ui", ui_context)

# Work on specific module
module="auth"
read_memory(`module.${module}`)
```

### Pattern: Time-Travel Debugging
For tracking down regressions:
```bash
write_memory("state_v1", initial_state)
# Make changes
write_memory("state_v2", after_change_1)
# Make more changes
write_memory("state_v3", after_change_2)

# Compare states
read_memory("state_v1")
read_memory("state_v3")
```

### Pattern: Collaborative Context
For team handoffs:
```bash
write_memory("handoff", {
  "developer": "your_name",
  "date": new Date().toISOString(),
  "completed": "What's done",
  "in_progress": "What's active",
  "blockers": "What's blocking",
  "notes": "Special considerations",
  "contacts": "Who to ask for help"
})
```

---

## Appendix: Integration with FantasyWritingApp

### Project-Specific Context Points
- **Vite Migration**: Track migration status in memory
- **Test Coverage**: Store coverage metrics between sessions
- **Component Development**: Preserve component state during development
- **Cypress Tests**: Remember test patterns and selectors

### Recommended Memory Structure for This Project
```javascript
{
  "checkpoint": "Primary work state",
  "vite_migration": "Migration progress tracking",
  "test_coverage": "Current coverage metrics",
  "component_work": "Active component development",
  "cypress_patterns": "Test selector patterns",
  "known_issues": "Tracked bugs and workarounds"
}
```

---

*Last Updated: Context management guide aligned with FantasyWritingApp requirements and Claude Code best practices.*