#!/usr/bin/env python3
"""
Final comprehensive fix for all syntax errors in TypeScript files.
"""

import re
import os
import glob

def fix_all_patterns(content):
    """Fix all variations of syntax errors."""
    
    # Pattern 1: Fix lines with single property and comment at end
    # "    property: 'value' // ! HARDCODED: Should use design tokens,"
    # Should become:
    # "    property: 'value', // ! HARDCODED: Should use design tokens"
    content = re.sub(
        r"(\s+)([\w]+):\s*(['\"][^'\"]+['\"])\s*// ! HARDCODED: Should use design tokens,",
        r"\1\2: \3, // ! HARDCODED: Should use design tokens",
        content
    )
    
    # Pattern 2: Fix lines with two properties and comments on same line
    # ", property1: 'value1' // ! HARDCODED..., property2: 'value2' // ! HARDCODED..."
    content = re.sub(
        r",\s*([\w]+):\s*(['\"][^'\"]+['\"])\s*// ! HARDCODED: Should use design tokens,\s*([\w]+):\s*(['\"][^'\"]+['\"])\s*// ! HARDCODED: Should use design tokens,",
        r",\n    \1: \2, // ! HARDCODED: Should use design tokens\n    \3: \4, // ! HARDCODED: Should use design tokens",
        content
    )
    
    # Pattern 3: Fix object definitions with comments breaking the syntax
    # "  objectName: { property: 'value' // ! HARDCODED..., property2: 'value2' // ! HARDCODED..."
    content = re.sub(
        r"(\s+)([\w]+):\s*\{\s*([\w]+):\s*(['\"][^'\"]+['\"])\s*// ! HARDCODED: Should use design tokens,\s*([\w]+):\s*(['\"][^'\"]+['\"])\s*// ! HARDCODED: Should use design tokens,",
        r"\1\2: {\n    \3: \4, // ! HARDCODED: Should use design tokens\n    \5: \6, // ! HARDCODED: Should use design tokens",
        content
    )
    
    # Pattern 4: Fix object definitions with single property
    # "  objectName: { property: 'value' // ! HARDCODED: Should use design tokens,"
    content = re.sub(
        r"(\s+)([\w]+):\s*\{\s*([\w]+):\s*(['\"][^'\"]+['\"])\s*// ! HARDCODED: Should use design tokens,",
        r"\1\2: {\n    \3: \4, // ! HARDCODED: Should use design tokens",
        content
    )
    
    # Pattern 5: Fix lines that have comment then closing brace
    content = re.sub(
        r"(\s+)([\w]+):\s*(['\"][^'\"]+['\"])\s*// ! HARDCODED: Should use design tokens\s*\}",
        r"\1\2: \3, // ! HARDCODED: Should use design tokens\n  }",
        content
    )
    
    # Pattern 6: Clean up duplicate comments on same line
    content = re.sub(
        r"// ! HARDCODED: Should use design tokens\s*// ! HARDCODED: Should use design tokens",
        r"// ! HARDCODED: Should use design tokens",
        content
    )
    
    # Pattern 7: Fix color arrays in React Native
    # "colors={[' // ! HARDCODED: Should use design tokens // ! HARDCODED: Should use design tokens#6366F1']}"
    content = re.sub(
        r"colors=\{?\['\s*// ! HARDCODED[^']*#([\w]+)'\]\}?",
        r"colors={['#\1']} // ! HARDCODED: Should use design tokens",
        content
    )
    
    # Pattern 8: Fix JSX ternary operators with comments
    content = re.sub(
        r"\?([^:]+)// ! HARDCODED: Should use design tokens\s*:",
        r"? \1 :",
        content
    )
    
    # Pattern 9: Fix function calls with comments inside arguments
    content = re.sub(
        r"setSearchQuery\(''\s*// ! HARDCODED: Should use design tokens\)",
        r"setSearchQuery('')",
        content
    )
    
    return content

def process_file(filepath):
    """Process a single file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        fixed = fix_all_patterns(content)
        
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
    """Process all TypeScript files that need fixing."""
    
    src_dir = "/Users/jacobstoragepug/Desktop/FantasyWritingApp/src"
    
    # Get all .ts and .tsx files
    ts_files = glob.glob(os.path.join(src_dir, "**/*.ts"), recursive=True)
    tsx_files = glob.glob(os.path.join(src_dir, "**/*.tsx"), recursive=True)
    
    all_files = ts_files + tsx_files
    
    print(f"Processing {len(all_files)} TypeScript files...")
    
    fixed_count = 0
    for filepath in all_files:
        if process_file(filepath):
            fixed_count += 1
    
    print(f"\nSummary: Fixed {fixed_count} files out of {len(all_files)} total files.")

if __name__ == "__main__":
    main()