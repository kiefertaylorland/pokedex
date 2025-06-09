#!/usr/bin/env python3
"""
Frontend Validation Script
Validates the refactored frontend code for common issues
"""

import os
import json
import re
from pathlib import Path

def validate_frontend():
    """Main validation function"""
    print("🔍 Frontend Validation Script")
    print("=" * 50)
    
    issues = []
    warnings = []
    
    # Check file structure
    print("📁 Checking file structure...")
    structure_issues = check_file_structure()
    issues.extend(structure_issues)
    
    # Check JavaScript modules
    print("📜 Checking JavaScript modules...")
    js_issues = check_javascript_modules()
    issues.extend(js_issues)
    
    # Check HTML accessibility
    print("♿ Checking HTML accessibility...")
    html_issues = check_html_accessibility()
    issues.extend(html_issues)
    
    # Check CSS for accessibility
    print("🎨 Checking CSS accessibility...")
    css_issues = check_css_accessibility()
    issues.extend(css_issues)
    
    # Check security measures
    print("🔒 Checking security measures...")
    security_issues = check_security()
    issues.extend(security_issues)
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 VALIDATION SUMMARY")
    print("=" * 50)
    
    if not issues and not warnings:
        print("✅ All checks passed! Frontend is ready for production.")
    else:
        if warnings:
            print(f"⚠️  {len(warnings)} warnings found:")
            for warning in warnings:
                print(f"   • {warning}")
        
        if issues:
            print(f"❌ {len(issues)} issues found:")
            for issue in issues:
                print(f"   • {issue}")
            print("\n🔧 Please address these issues before deployment.")
    
    return len(issues) == 0

def check_file_structure():
    """Check that all required files exist"""
    issues = []
    
    required_files = [
        'index.html',
        'assets/js/pokedexApp.js',
        'assets/js/constants.js',
        'assets/js/components/pokemonCardRenderer.js',
        'assets/js/components/pokemonDetailView.js',
        'assets/js/controllers/searchController.js',
        'assets/js/managers/dataManager.js',
        'assets/js/managers/uiController.js',
        'assets/js/utils/security.js',
        'assets/style.css',
        'script.js',  # Legacy compatibility
    ]
    
    for file_path in required_files:
        if not os.path.exists(file_path):
            issues.append(f"Missing required file: {file_path}")
    
    return issues

def check_javascript_modules():
    """Check JavaScript modules for common issues"""
    import re
    issues = []
    
    js_files = [
        'assets/js/pokedexApp.js',
        'assets/js/constants.js',
        'assets/js/components/pokemonCardRenderer.js',
        'assets/js/components/pokemonDetailView.js',
        'assets/js/controllers/searchController.js',
        'assets/js/managers/dataManager.js',
        'assets/js/managers/uiController.js',
        'assets/js/utils/security.js',
    ]
    
    for js_file in js_files:
        if os.path.exists(js_file):
            with open(js_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Check for export statements
                if 'export' not in content:
                    issues.append(f"{js_file}: Missing export statements")
                
                # Check for JSDoc comments
                if '/**' not in content:
                    issues.append(f"{js_file}: Missing JSDoc documentation")
                
                # Check for console.log (should be minimal in production)
                console_logs = len(re.findall(r'console\.log\(', content))
                if console_logs > 2:
                    issues.append(f"{js_file}: Too many console.log statements ({console_logs})")
                
                # Check for proper error handling (try blocks without catch)
                try_blocks = re.findall(r'\btry\s*\{', content)
                catch_blocks = re.findall(r'\bcatch\s*\(', content)
                if len(try_blocks) > len(catch_blocks):
                    issues.append(f"{js_file}: Try without catch found")
    
    return issues

def check_html_accessibility():
    """Check HTML for accessibility features"""
    issues = []
    
    if os.path.exists('index.html'):
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Check for lang attribute
            if 'lang=' not in content:
                issues.append("HTML: Missing lang attribute")
            
            # Check for meta description
            if 'meta name="description"' not in content:
                issues.append("HTML: Missing meta description")
            
            # Check for skip link
            if 'skip-link' not in content:
                issues.append("HTML: Missing skip link for keyboard navigation")
            
            # Check for ARIA landmarks
            if 'role="main"' not in content:
                issues.append("HTML: Missing main landmark")
            
            if 'role="banner"' not in content:
                issues.append("HTML: Missing banner landmark")
            
            # Check for aria-live regions
            if 'aria-live' not in content:
                issues.append("HTML: Missing aria-live regions for dynamic content")
    
    return issues

def check_css_accessibility():
    """Check CSS for accessibility features"""
    issues = []
    
    if os.path.exists('assets/style.css'):
        with open('assets/style.css', 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Check for screen reader only styles
            if '.sr-only' not in content:
                issues.append("CSS: Missing screen reader only styles")
            
            # Check for focus styles
            if ':focus' not in content:
                issues.append("CSS: Missing focus styles")
            
            # Check for reduced motion support
            if 'prefers-reduced-motion' not in content:
                issues.append("CSS: Missing reduced motion support")
            
            # Check for high contrast support
            if 'prefers-contrast' not in content:
                issues.append("CSS: Missing high contrast support")
    
    return issues

def check_security():
    """Check security measures"""
    issues = []
    
    # Check security.js
    if os.path.exists('assets/js/utils/security.js'):
        with open('assets/js/utils/security.js', 'r', encoding='utf-8') as f:
            content = f.read()
            
            if 'sanitizeHTML' not in content:
                issues.append("Security: Missing HTML sanitization function")
            
            if 'createSafeElement' not in content:
                issues.append("Security: Missing safe element creation function")
            
            if 'validatePokemonId' not in content:
                issues.append("Security: Missing input validation function")
    
    # Check HTML security headers
    if os.path.exists('index.html'):
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()
            
            if 'X-Content-Type-Options' not in content:
                issues.append("Security: Missing X-Content-Type-Options header")
            
            if 'X-Frame-Options' not in content:
                issues.append("Security: Missing X-Frame-Options header")
    
    return issues

if __name__ == "__main__":
    # Change to the pokedex directory
    os.chdir('/Users/kiefer.land/code/personal/pokedex')
    
    success = validate_frontend()
    exit(0 if success else 1)
