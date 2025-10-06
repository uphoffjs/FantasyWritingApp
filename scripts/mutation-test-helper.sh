#!/bin/bash

# Mutation Testing Helper Script
# Purpose: Automate mutation testing workflow with built-in safety checks
# Usage: ./scripts/mutation-test-helper.sh [command] [args]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MUTATION_BRANCH="mutation-testing"
LOG_DIR="claudedocs/mutation-testing/logs"
REPORT_DIR="claudedocs/mutation-testing/reports"

# Ensure log directory exists
mkdir -p "$LOG_DIR"
mkdir -p "$REPORT_DIR"

#######################################
# Print colored message
# Arguments:
#   $1: Color code
#   $2: Message
#######################################
print_message() {
    echo -e "${1}${2}${NC}"
}

#######################################
# Print error and exit
# Arguments:
#   $1: Error message
#######################################
error_exit() {
    print_message "$RED" "❌ ERROR: $1"
    exit 1
}

#######################################
# Print success message
# Arguments:
#   $1: Success message
#######################################
success() {
    print_message "$GREEN" "✅ $1"
}

#######################################
# Print warning message
# Arguments:
#   $1: Warning message
#######################################
warning() {
    print_message "$YELLOW" "⚠️  $1"
}

#######################################
# Print info message
# Arguments:
#   $1: Info message
#######################################
info() {
    print_message "$BLUE" "ℹ️  $1"
}

#######################################
# Validate on mutation-testing branch
#######################################
validate_branch() {
    current_branch=$(git branch --show-current)

    if [ "$current_branch" != "$MUTATION_BRANCH" ]; then
        error_exit "Not on $MUTATION_BRANCH branch. Current branch: $current_branch"
    fi

    success "On correct branch: $MUTATION_BRANCH"
}

#######################################
# Check for uncommitted changes
#######################################
check_uncommitted_changes() {
    if [ -n "$(git status --porcelain)" ]; then
        warning "Uncommitted changes detected"
        git status --short
        return 1
    fi
    return 0
}

#######################################
# Start mutation testing session
#######################################
start_session() {
    info "Starting mutation testing session..."

    # Check if already on mutation-testing branch
    current_branch=$(git branch --show-current)

    if [ "$current_branch" = "$MUTATION_BRANCH" ]; then
        warning "Already on $MUTATION_BRANCH branch"

        # Check for uncommitted changes
        if ! check_uncommitted_changes; then
            read -p "Restore all changes? (y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git checkout .
                success "All changes restored"
            else
                error_exit "Please commit or restore changes before starting"
            fi
        fi
    else
        # Check if mutation-testing branch exists
        if git show-ref --verify --quiet refs/heads/$MUTATION_BRANCH; then
            warning "Branch $MUTATION_BRANCH already exists"
            read -p "Delete and recreate? (y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git checkout main 2>/dev/null || git checkout dev
                git branch -D $MUTATION_BRANCH
                git checkout -b $MUTATION_BRANCH
                success "Recreated $MUTATION_BRANCH branch"
            else
                git checkout $MUTATION_BRANCH
                info "Switched to existing $MUTATION_BRANCH branch"
            fi
        else
            git checkout -b $MUTATION_BRANCH
            success "Created new $MUTATION_BRANCH branch"
        fi
    fi

    # Initialize session log
    session_log="$LOG_DIR/session-$(date +%Y%m%d-%H%M%S).log"
    echo "Mutation Testing Session Started: $(date)" > "$session_log"
    echo "Branch: $MUTATION_BRANCH" >> "$session_log"
    echo "---" >> "$session_log"

    success "Mutation testing session started"
    info "Session log: $session_log"
    info ""
    info "Next steps:"
    info "1. Edit a component file (introduce mutation)"
    info "2. Run: ./scripts/mutation-test-helper.sh test <test-file-path>"
    info "3. Document result"
    info "4. Run: ./scripts/mutation-test-helper.sh restore <component-file>"
    info "5. Repeat for next mutation"
}

#######################################
# Run test with logging
# Arguments:
#   $1: Test file path
#######################################
run_test() {
    if [ -z "$1" ]; then
        error_exit "Test file path required. Usage: $0 test <test-file-path>"
    fi

    validate_branch

    test_file="$1"
    test_log="$LOG_DIR/test-$(date +%Y%m%d-%H%M%S).log"

    info "Running test: $test_file"
    info "Log file: $test_log"

    # Run test and capture output
    if SPEC="$test_file" npm run cypress:docker:test:spec > "$test_log" 2>&1; then
        success "Test PASSED"
        warning "If mutation was introduced, test passing is BAD (gap identified)"
    else
        success "Test FAILED (expected when mutation introduced)"
        info "Test caught the mutation ✅"
    fi

    info ""
    info "View full output: cat $test_log"
    info "Next: Document result, then run restore command"
}

#######################################
# Restore file after mutation
# Arguments:
#   $1: File path to restore
#######################################
restore_file() {
    if [ -z "$1" ]; then
        error_exit "File path required. Usage: $0 restore <file-path>"
    fi

    validate_branch

    file_path="$1"

    # Check if file has changes
    if ! git diff --quiet "$file_path"; then
        # Save diff before restoring
        diff_file="$LOG_DIR/mutation-$(date +%Y%m%d-%H%M%S).diff"
        git diff "$file_path" > "$diff_file"
        info "Saved diff to: $diff_file"

        # Restore file
        git checkout "$file_path"
        success "Restored: $file_path"

        # Verify restoration
        if git diff --quiet "$file_path"; then
            success "Verification: File successfully restored"
        else
            warning "Verification: File may still have changes"
        fi
    else
        info "No changes to restore in: $file_path"
    fi
}

#######################################
# Restore all files
#######################################
restore_all() {
    validate_branch

    if check_uncommitted_changes; then
        info "No changes to restore"
        return 0
    fi

    warning "This will restore ALL modified files"
    git status --short

    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Cancelled"
        return 0
    fi

    # Save diff
    diff_file="$LOG_DIR/restore-all-$(date +%Y%m%d-%H%M%S).diff"
    git diff > "$diff_file"
    info "Saved diff to: $diff_file"

    # Restore all
    git checkout .
    success "Restored all files"

    # Verify
    if check_uncommitted_changes; then
        success "Verification: All files restored"
    else
        warning "Verification: Some files may still have changes"
    fi
}

#######################################
# End mutation testing session
#######################################
end_session() {
    validate_branch

    info "Ending mutation testing session..."

    # Check for uncommitted changes
    if ! check_uncommitted_changes; then
        warning "Uncommitted changes detected. These will be lost when switching branches."
        git status --short

        read -p "Restore all changes before ending? (Y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            restore_all
        fi
    fi

    # Verify clean state
    if ! check_uncommitted_changes; then
        error_exit "Please restore all changes before ending session"
    fi

    # Switch back to main/dev
    if git show-ref --verify --quiet refs/heads/main; then
        git checkout main
        success "Switched to main branch"
    elif git show-ref --verify --quiet refs/heads/dev; then
        git checkout dev
        success "Switched to dev branch"
    else
        error_exit "Cannot find main or dev branch"
    fi

    # Ask to delete mutation-testing branch
    read -p "Delete $MUTATION_BRANCH branch? (Y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        git branch -D $MUTATION_BRANCH
        success "Deleted $MUTATION_BRANCH branch"
    else
        info "Kept $MUTATION_BRANCH branch"
    fi

    success "Mutation testing session ended"
    info ""
    info "Reports location: $REPORT_DIR"
    info "Logs location: $LOG_DIR"
}

#######################################
# Show session status
#######################################
show_status() {
    info "Mutation Testing Status"
    echo ""

    # Current branch
    current_branch=$(git branch --show-current)
    if [ "$current_branch" = "$MUTATION_BRANCH" ]; then
        success "Branch: $current_branch ✅"
    else
        warning "Branch: $current_branch (expected: $MUTATION_BRANCH)"
    fi

    # Git status
    if check_uncommitted_changes; then
        success "Working tree: Clean ✅"
    else
        warning "Working tree: Uncommitted changes"
        git status --short
    fi

    # Session files
    echo ""
    info "Session files:"
    echo "  Reports: $REPORT_DIR"
    if [ -d "$REPORT_DIR" ] && [ "$(ls -A $REPORT_DIR 2>/dev/null)" ]; then
        ls -1 "$REPORT_DIR" | sed 's/^/    - /'
    else
        echo "    (empty)"
    fi

    echo "  Logs: $LOG_DIR"
    if [ -d "$LOG_DIR" ] && [ "$(ls -A $LOG_DIR 2>/dev/null)" ]; then
        ls -1 "$LOG_DIR" | tail -5 | sed 's/^/    - /'
        log_count=$(ls -1 "$LOG_DIR" | wc -l)
        if [ "$log_count" -gt 5 ]; then
            echo "    ... and $((log_count - 5)) more"
        fi
    else
        echo "    (empty)"
    fi
}

#######################################
# Prevent accidental commits
#######################################
prevent_commit() {
    validate_branch
    error_exit "Commits not allowed on $MUTATION_BRANCH branch. Use 'restore' command instead."
}

#######################################
# Show help
#######################################
show_help() {
    cat << EOF
Mutation Testing Helper Script

USAGE:
    $0 <command> [arguments]

COMMANDS:
    start               Start mutation testing session
                       Creates mutation-testing branch and initializes logging

    test <test-file>    Run test after introducing mutation
                       Example: $0 test cypress/e2e/auth/login.cy.ts

    restore <file>      Restore file after test (undo mutation)
                       Example: $0 restore src/screens/LoginScreen.tsx

    restore-all         Restore all modified files

    end                 End mutation testing session
                       Switches back to main/dev and optionally deletes branch

    status              Show current session status

    help                Show this help message

WORKFLOW:
    1. ./scripts/mutation-test-helper.sh start
    2. Edit component file (introduce mutation)
    3. ./scripts/mutation-test-helper.sh test <test-file>
    4. Document result in mutation report
    5. ./scripts/mutation-test-helper.sh restore <component-file>
    6. Repeat steps 2-5 for each mutation
    7. ./scripts/mutation-test-helper.sh end

SAFETY FEATURES:
    - Validates correct branch before operations
    - Prevents accidental commits
    - Saves diffs before restoration
    - Logs all test runs
    - Verifies file restoration

DOCUMENTATION:
    See claudedocs/MUTATION-TESTING-GUIDE.md for complete guide

EOF
}

#######################################
# Main script logic
#######################################
main() {
    case "${1:-}" in
        start)
            start_session
            ;;
        test)
            run_test "$2"
            ;;
        restore)
            restore_file "$2"
            ;;
        restore-all)
            restore_all
            ;;
        end)
            end_session
            ;;
        status)
            show_status
            ;;
        help|--help|-h)
            show_help
            ;;
        commit)
            prevent_commit
            ;;
        "")
            error_exit "No command specified. Use '$0 help' for usage."
            ;;
        *)
            error_exit "Unknown command: $1. Use '$0 help' for usage."
            ;;
    esac
}

# Run main function
main "$@"
