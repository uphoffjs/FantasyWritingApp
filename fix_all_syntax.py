#!/usr/bin/env python3
"""
Fix all syntax errors caused by improper comment placement in TypeScript/TSX files.
This script handles all edge cases properly.
"""

import re
import os
import glob

def fix_syntax_errors(content):
    """Fix various syntax errors caused by improper comment placement."""
    
    # Pattern 1: Fix property definitions where the comment is breaking the line
    # e.g., "property: value // ! HARDCODED..." → "property: value, // ! HARDCODED..."
    pattern = r"(\s+)([\w]+):\s*(['\"][\w#]+['\"])\s*// ! HARDCODED: Should use design tokens,"
    replacement = r"\1\2: \3, // ! HARDCODED: Should use design tokens"
    content = re.sub(pattern, replacement, content)
    
    # Pattern 2: Fix property definitions in object literals
    # e.g., ", property: value // ! HARDCODED..." → ",\n    property: value, // ! HARDCODED..."
    pattern = r",\s*([\w]+):\s*(['\"][\w#]+['\"])\s*// ! HARDCODED: Should use design tokens,"
    replacement = r",\n    \1: \2, // ! HARDCODED: Should use design tokens"
    content = re.sub(pattern, replacement, content)
    
    # Pattern 3: Fix object property shorthand syntax issues
    # e.g., "{ property: value // ! HARDCODED..." → "{\n    property: value, // ! HARDCODED..."
    pattern = r"\{\s*([\w]+):\s*(['\"][\w#]+['\"])\s*// ! HARDCODED: Should use design tokens,\s*([\w]+):\s*(['\"][\w#]+['\"])\s*// ! HARDCODED: Should use design tokens,"
    replacement = r"{\n    \1: \2, // ! HARDCODED: Should use design tokens\n    \3: \4, // ! HARDCODED: Should use design tokens"
    content = re.sub(pattern, replacement, content)
    
    # Pattern 4: Fix cases where there are multiple comments on same line
    pattern = r"// ! HARDCODED: Should use design tokens\s*// ! HARDCODED: Should use design tokens"
    replacement = r"// ! HARDCODED: Should use design tokens"
    content = re.sub(pattern, replacement, content)
    
    # Pattern 5: Fix closing brace issues
    # Fix lines that end with comma and should have closing brace
    lines = content.split('\n')
    fixed_lines = []
    
    for i, line in enumerate(lines):
        # Check if line has the comment and needs fixing
        if '// ! HARDCODED: Should use design tokens' in line:
            # Ensure proper comma placement
            if not line.strip().endswith(',') and not line.strip().endswith('{') and not line.strip().endswith('}'):
                if '// ! HARDCODED: Should use design tokens' in line:
                    line = line.replace('// ! HARDCODED: Should use design tokens', ', // ! HARDCODED: Should use design tokens')
        fixed_lines.append(line)
    
    content = '\n'.join(fixed_lines)
    
    return content

def process_file(filepath):
    """Process a single file to fix syntax errors."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        fixed = fix_syntax_errors(content)
        
        if original != fixed:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed)
            print(f"Fixed: {filepath}")
            return True
        else:
            print(f"No changes needed: {filepath}")
            return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Process all TypeScript files with known syntax issues."""
    
    # List of files that need fixing based on TypeScript errors
    files_to_fix = [
        "/Users/jacobstoragepug/Desktop/FantasyWritingApp/src/components/CreateElementModal.tsx",
        "/Users/jacobstoragepug/Desktop/FantasyWritingApp/src/components/CrossPlatformDatePicker.tsx",
        "/Users/jacobstoragepug/Desktop/FantasyWritingApp/src/components/CrossPlatformPicker.tsx",
        "/Users/jacobstoragepug/Desktop/FantasyWritingApp/src/components/ElementEditor.tsx",
        "/Users/jacobstoragepug/Desktop/FantasyWritingApp/src/components/ErrorBoundary.tsx",
        "/Users/jacobstoragepug/Desktop/FantasyWritingApp/src/components/ImportExport.tsx",
        "/Users/jacobstoragepug/Desktop/FantasyWritingApp/src/components/ImportExportWeb.tsx",
        "/Users/jacobstoragepug/Desktop/FantasyWritingApp/src/components/InstallPrompt.tsx",
        "/Users/jacobstoragepug/Desktop/FantasyWritingApp/src/components/MarkdownEditor.tsx",
        "/Users/jacobstoragepug/Desktop/FantasyWritingApp/src/components/ProjectList.tsx",
        "/Users/jacobstoragepug/Desktop/FantasyWritingApp/src/components/RelationshipManager.tsx",
        "/Users/jacobstoragepug/Desktop/FantasyWritingApp/src/components/TemplateEditor.tsx",
        "/Users/jacobstoragepug/Desktop/FantasyWritingApp/src/components/TemplateSelector.tsx",
        "/Users/jacobstoragepug/Desktop/FantasyWritingApp/src/components/TextInput.tsx",
        "/Users/jacobstoragepug/Desktop/FantasyWritingApp/src/components/Button.tsx",
    ]
    
    print(f"Processing {len(files_to_fix)} files...")
    
    fixed_count = 0
    for filepath in files_to_fix:
        if os.path.exists(filepath):
            if process_file(filepath):
                fixed_count += 1
        else:
            print(f"File not found: {filepath}")
    
    print(f"\nSummary: Fixed {fixed_count} files out of {len(files_to_fix)} processed.")

if __name__ == "__main__":
    main()