#!/usr/bin/env python
"""
Theme Consistency Checker for SudaStock

This script scans HTML, CSS, and JS files to ensure the theme colors
are consistently applied throughout the website.

Theme colors:
- Primary Dark: #1B1464 (Dark blue from logo)
- Accent: #786D3C (Gold accent from logo)
"""

import os
import re
import sys
from pathlib import Path
from collections import defaultdict

# Theme colors to check for
THEME_COLORS = {
    'primary-dark': '#1B1464',  # Dark blue from logo
    'accent': '#786D3C',        # Gold accent from logo
}

# File extensions to scan
EXTENSIONS = ['.html', '.css', '.js', '.scss', '.sass']

def find_files(directory, extensions):
    """Find all files with given extensions in directory."""
    files = []
    for root, _, filenames in os.walk(directory):
        for filename in filenames:
            if any(filename.endswith(ext) for ext in extensions):
                files.append(os.path.join(root, filename))
    return files

def check_color_usage(file_path):
    """Check if the file uses the theme colors."""
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        try:
            content = f.read()
            
            # Check for color variables
            has_var_primary = '--primary-dark' in content or 'var(--primary-dark)' in content
            has_var_accent = '--accent' in content or 'var(--accent)' in content
            
            # Check for direct color codes
            has_direct_primary = THEME_COLORS['primary-dark'].lower() in content.lower()
            has_direct_accent = THEME_COLORS['accent'].lower() in content.lower()
            
            return {
                'file': file_path,
                'has_var_primary': has_var_primary,
                'has_var_accent': has_var_accent,
                'has_direct_primary': has_direct_primary,
                'has_direct_accent': has_direct_accent,
                'uses_theme': has_var_primary or has_var_accent or has_direct_primary or has_direct_accent
            }
        except UnicodeDecodeError:
            return {
                'file': file_path,
                'error': 'Cannot decode file',
                'uses_theme': False
            }

def find_other_colors(file_path):
    """Find other color codes that might need to be replaced with theme colors."""
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        try:
            content = f.read()
            
            # Find hex colors
            hex_colors = set(re.findall(r'#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})', content))
            
            # Find rgb/rgba colors
            rgb_colors = set(re.findall(r'rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)', content))
            rgba_colors = set(re.findall(r'rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)', content))
            
            # Exclude theme colors
            hex_colors = {c for c in hex_colors if c.lower() not in [THEME_COLORS['primary-dark'][1:].lower(), THEME_COLORS['accent'][1:].lower()]}
            
            return {
                'file': file_path,
                'hex_colors': hex_colors,
                'rgb_colors': rgb_colors,
                'rgba_colors': rgba_colors
            }
        except UnicodeDecodeError:
            return {
                'file': file_path,
                'error': 'Cannot decode file',
                'hex_colors': set(),
                'rgb_colors': set(),
                'rgba_colors': set()
            }

def main():
    # Get the base directory
    base_dir = Path(__file__).resolve().parent
    
    print(f"Checking theme consistency in {base_dir}")
    print(f"Theme colors: Primary Dark: {THEME_COLORS['primary-dark']}, Accent: {THEME_COLORS['accent']}")
    print("-" * 80)
    
    # Find all relevant files
    files = find_files(base_dir, EXTENSIONS)
    print(f"Found {len(files)} files to check")
    
    # Check color usage
    results = [check_color_usage(file) for file in files]
    
    # Summarize results
    uses_theme = [r for r in results if r.get('uses_theme', False)]
    no_theme = [r for r in results if not r.get('uses_theme', False)]
    
    print(f"\n{len(uses_theme)} files use theme colors:")
    for r in uses_theme:
        print(f"  {r['file']}")
        if r.get('has_var_primary', False):
            print("    - Uses --primary-dark variable")
        if r.get('has_var_accent', False):
            print("    - Uses --accent variable")
        if r.get('has_direct_primary', False) and not r.get('has_var_primary', False):
            print("    - Uses direct primary color code (should use variable)")
        if r.get('has_direct_accent', False) and not r.get('has_var_accent', False):
            print("    - Uses direct accent color code (should use variable)")
    
    print(f"\n{len(no_theme)} files do not use theme colors:")
    for r in no_theme:
        print(f"  {r['file']}")
        if r.get('error'):
            print(f"    - Error: {r['error']}")
    
    # Find other colors that might need to be replaced
    print("\nChecking for other color codes that might need to be replaced:")
    color_results = [find_other_colors(file) for file in files]
    
    # Count unique colors across all files
    all_hex_colors = set()
    for r in color_results:
        all_hex_colors.update(r.get('hex_colors', set()))
    
    print(f"Found {len(all_hex_colors)} unique hex colors across all files")
    print("Top colors that might need to be replaced with theme colors:")
    
    # Count frequency of each color
    color_count = defaultdict(int)
    for r in color_results:
        for color in r.get('hex_colors', set()):
            color_count[color.lower()] += 1
    
    # Show most common colors
    for color, count in sorted(color_count.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  #{color}: used in {count} files")
    
    print("\nRecommendations:")
    print("1. Replace direct color codes with CSS variables")
    print("2. Ensure all UI elements use the theme colors")
    print("3. Update any inconsistent colors to match the theme")
    print(f"4. Primary Dark: {THEME_COLORS['primary-dark']} (Dark blue from logo)")
    print(f"5. Accent: {THEME_COLORS['accent']} (Gold accent from logo)")

if __name__ == "__main__":
    main()
