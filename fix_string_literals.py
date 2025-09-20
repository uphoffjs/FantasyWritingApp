#!/usr/bin/env python3
"""
Script to fix unterminated string literals caused by inline comments.
The issue is that there are comments inside string literals like:
'12px // ! HARDCODED: Should use design tokens
16px'

These need to be fixed to:
'12px 16px' // ! HARDCODED: Should use design tokens
"""

import re
import os
import glob

def fix_string_literals(content):
    """Fix string literals with embedded comments."""
    
    # Pattern to match strings with embedded comment on first line
    # Matches: '...// ! HARDCODED: Should use design tokens\n      ...'
    pattern1 = r"'([^']*?)(\s*)// ! HARDCODED: Should use design tokens\s*\n\s*([^']*?)'"
    replacement1 = r"'\1 \3' // ! HARDCODED: Should use design tokens"
    content = re.sub(pattern1, replacement1, content)
    
    # Pattern to match strings with just the comment inside (single line)
    # Matches: 'value // ! HARDCODED: Should use design tokens'
    pattern2 = r"'([^']*?)\s*// ! HARDCODED: Should use design tokens([^']*?)'"
    replacement2 = r"'\1\2' // ! HARDCODED: Should use design tokens"
    content = re.sub(pattern2, replacement2, content)
    
    # Handle cases where the comment appears on the second line of a string
    # Matches: '...\n      ...// ! HARDCODED: Should use design tokens'
    pattern3 = r"'([^']*?)\n\s*([^']*?)// ! HARDCODED: Should use design tokens([^']*?)'"
    replacement3 = r"'\1 \2\3' // ! HARDCODED: Should use design tokens"
    content = re.sub(pattern3, replacement3, content)
    
    return content

def process_file(filepath):
    """Process a single file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        fixed = fix_string_literals(content)
        
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
    """Main function to process all TypeScript/TSX files."""
    
    # Get all TypeScript files in src directory
    src_dir = "/Users/jacobstoragepug/Desktop/FantasyWritingApp/src"
    
    # Find all .ts and .tsx files
    ts_files = glob.glob(os.path.join(src_dir, "**/*.ts"), recursive=True)
    tsx_files = glob.glob(os.path.join(src_dir, "**/*.tsx"), recursive=True)
    
    all_files = ts_files + tsx_files
    
    print(f"Found {len(all_files)} TypeScript files to check...")
    
    fixed_count = 0
    for filepath in all_files:
        if process_file(filepath):
            fixed_count += 1
    
    print(f"\nSummary: Fixed {fixed_count} files out of {len(all_files)} total files.")

if __name__ == "__main__":
    main()