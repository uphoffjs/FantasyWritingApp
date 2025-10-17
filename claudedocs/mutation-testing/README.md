# Mutation Testing Reports

This directory contains mutation testing reports and session logs.

## Directory Structure

```
claudedocs/mutation-testing/
├── README.md                    # This file
├── SUMMARY.md                   # Aggregate summary across all components
├── component-inventory.md       # Tracking file for all components tested
├── reports/                     # Per-component mutation test reports
│   ├── LoginScreen-mutation-report.md
│   ├── ProjectListScreen-mutation-report.md
│   ├── ProjectCard-mutation-report.md
│   └── ... (one per component)
└── logs/                        # Session and test execution logs
    ├── session-YYYYMMDD-HHMMSS.log
    ├── test-YYYYMMDD-HHMMSS.log
    ├── mutation-YYYYMMDD-HHMMSS.diff
    └── ... (generated during sessions)
```

## File Descriptions

### SUMMARY.md

Aggregate statistics across all mutation testing:

- Total mutations tested
- Overall pass/fail rate
- Test quality scores by component
- Common test gap patterns
- Improvement recommendations

### component-inventory.md

Tracking file for all components undergoing mutation testing:

- Component name and file path
- Associated test file
- Priority level
- Status (pending/in-progress/complete)
- Test quality score

### reports/ Directory

Individual mutation test reports for each component:

- Detailed mutation-by-mutation results
- Passed mutations (tests correctly failed)
- Failed mutations (test gaps identified)
- Recommended test improvements
- Component-specific analysis

### logs/ Directory

Session logs and test execution artifacts:

- Session logs (start/end timestamps, mutations tested)
- Test execution logs (Cypress output)
- Mutation diffs (saved before restoration)
- Restoration verification logs

## Usage

### Starting Mutation Testing

```bash
# Initialize session
./scripts/mutation-test-helper.sh start

# This creates the mutation-testing branch and initializes logging
```

### During Mutation Testing

```bash
# After introducing a mutation, run test
./scripts/mutation-test-helper.sh test cypress/e2e/path/to/test.cy.ts

# Document result in component report
# Then restore the component
./scripts/mutation-test-helper.sh restore src/path/to/Component.tsx
```

### Ending Mutation Testing

```bash
# End session (switches back to main, optionally deletes branch)
./scripts/mutation-test-helper.sh end
```

## Report Templates

See [MUTATION-TESTING-GUIDE.md](../MUTATION-TESTING-GUIDE.md#documentation-templates) for:

- Per-component report template
- Aggregate summary template
- Component inventory template

## Integration with Auth Tests

Mutation testing is integrated into each auth test phase:

- **[Phase 1](../../TODO-AUTH-TESTS-PHASE-1-INFRASTRUCTURE.md)**: Infrastructure validation
- **[Phase 2](../../TODO-AUTH-TESTS-PHASE-2-SIGNIN.md)**: Sign-in flow validation
- **[Phase 3](../../TODO-AUTH-TESTS-PHASE-3-SIGNUP.md)**: Sign-up flow validation
- **[Phase 4](../../TODO-AUTH-TESTS-PHASE-4-SESSION.md)**: Session management validation
- **[Phase 5](../../TODO-AUTH-TESTS-PHASE-5-RECOVERY.md)**: Password recovery validation

Each phase includes component-specific mutation testing tasks.

## Related Documentation

- **[MUTATION-TESTING-GUIDE.md](../MUTATION-TESTING-GUIDE.md)**: Complete mutation testing guide
- **[CYPRESS-COMPLETE-REFERENCE.md](../CYPRESS-COMPLETE-REFERENCE.md)**: Cypress testing reference
- **[TEST-VALIDATION-GUIDE.md](../TEST-VALIDATION-GUIDE.md)**: Test validation workflows

## Safety Notes

⚠️ **Important**: This directory is used during mutation testing sessions on the `mutation-testing` branch. All mutations should be restored before ending the session. Do NOT commit broken code to main/dev branches.

✅ **Logs and reports** in this directory are safe to commit and provide valuable documentation of test quality validation.

---

**Last Updated**: 2025-10-06
**Version**: 1.0
