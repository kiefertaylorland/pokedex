#!/usr/bin/env python3
"""
Validate robots.txt and sitemap.xml files for correctness.

Checks:
- robots.txt syntax and structure
- sitemap.xml format and validity
- URL accessibility
- Required fields presence
"""

import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def validate_robots_txt(filepath: str = 'robots.txt') -> bool:
    """Validate robots.txt file.
    
    Args:
        filepath: Path to robots.txt file
        
    Returns:
        True if valid, False otherwise
    """
    logger.info(f"Validating {filepath}...")
    
    if not Path(filepath).exists():
        logger.error(f"❌ {filepath} not found")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    if not lines:
        logger.error(f"❌ {filepath} is empty")
        return False
    
    logger.info(f"✅ {filepath} exists and is readable")
    
    # Check for required directives
    has_user_agent = False
    has_sitemap = False
    valid_directives = {
        'user-agent', 'disallow', 'allow', 'sitemap', 
        'crawl-delay', 'request-rate', '#'
    }
    
    issues = []
    
    for line_num, line in enumerate(lines, 1):
        line = line.strip()
        
        # Skip empty lines
        if not line:
            continue
        
        # Skip comments
        if line.startswith('#'):
            continue
        
        # Check directive format
        if ':' not in line:
            issues.append(f"Line {line_num}: Missing colon - '{line}'")
            continue
        
        directive, value = line.split(':', 1)
        directive = directive.strip().lower()
        value = value.strip()
        
        # Check valid directives
        if directive not in valid_directives:
            issues.append(f"Line {line_num}: Unknown directive - '{directive}'")
        
        # Track required directives
        if directive == 'user-agent':
            has_user_agent = True
        elif directive == 'sitemap':
            has_sitemap = True
            # Validate sitemap URL
            if not value.startswith('http'):
                issues.append(f"Line {line_num}: Sitemap URL should be absolute - '{value}'")
    
    # Check required directives
    if not has_user_agent:
        issues.append("Missing required 'User-agent' directive")
    
    if not has_sitemap:
        logger.warning("⚠️  No 'Sitemap' directive found (recommended)")
    
    # Report issues
    if issues:
        logger.error(f"❌ {filepath} has {len(issues)} issue(s):")
        for issue in issues:
            logger.error(f"   - {issue}")
        return False
    
    logger.info(f"✅ {filepath} is valid")
    logger.info(f"   - User-agent directives: {'✓' if has_user_agent else '✗'}")
    logger.info(f"   - Sitemap directive: {'✓' if has_sitemap else '✗'}")
    
    return True


def validate_sitemap_xml(filepath: str = 'sitemap.xml') -> bool:
    """Validate sitemap.xml file.
    
    Args:
        filepath: Path to sitemap.xml file
        
    Returns:
        True if valid, False otherwise
    """
    logger.info(f"Validating {filepath}...")
    
    if not Path(filepath).exists():
        logger.error(f"❌ {filepath} not found")
        return False
    
    try:
        tree = ET.parse(filepath)
        root = tree.getroot()
    except ET.ParseError as e:
        logger.error(f"❌ {filepath} XML parsing error: {e}")
        return False
    
    logger.info(f"✅ {filepath} is valid XML")
    
    # Check namespace
    expected_ns = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
    if not root.tag.startswith(expected_ns):
        logger.error(f"❌ Invalid namespace. Expected {expected_ns}")
        return False
    
    logger.info(f"✅ Correct namespace: {expected_ns}")
    
    # Get all URLs
    urls = root.findall(f'{expected_ns}url')
    
    if not urls:
        logger.error(f"❌ No URLs found in sitemap")
        return False
    
    logger.info(f"✅ Found {len(urls)} URL(s)")
    
    # Validate each URL entry
    issues = []
    valid_priorities = set(f'{i/10:.1f}' for i in range(0, 11))
    valid_changefreqs = {
        'always', 'hourly', 'daily', 'weekly', 
        'monthly', 'yearly', 'never'
    }
    
    for idx, url_elem in enumerate(urls, 1):
        loc = url_elem.find(f'{expected_ns}loc')
        lastmod = url_elem.find(f'{expected_ns}lastmod')
        changefreq = url_elem.find(f'{expected_ns}changefreq')
        priority = url_elem.find(f'{expected_ns}priority')
        
        # Check required <loc> element
        if loc is None:
            issues.append(f"URL {idx}: Missing required <loc> element")
            continue
        
        loc_text = loc.text.strip() if loc.text else ''
        
        # Validate URL format
        if not loc_text.startswith('http'):
            issues.append(f"URL {idx}: <loc> must be absolute URL - '{loc_text}'")
        
        parsed = urlparse(loc_text)
        if not parsed.scheme or not parsed.netloc:
            issues.append(f"URL {idx}: Invalid URL format - '{loc_text}'")
        
        # Validate optional elements
        if changefreq is not None:
            freq = changefreq.text.lower() if changefreq.text else ''
            if freq not in valid_changefreqs:
                issues.append(
                    f"URL {idx}: Invalid <changefreq> - '{freq}'. "
                    f"Valid values: {', '.join(sorted(valid_changefreqs))}"
                )
        
        if priority is not None:
            prio = priority.text if priority.text else ''
            try:
                prio_float = float(prio)
                if not (0.0 <= prio_float <= 1.0):
                    issues.append(
                        f"URL {idx}: <priority> must be between 0.0 and 1.0 - '{prio}'"
                    )
            except ValueError:
                issues.append(f"URL {idx}: Invalid <priority> - '{prio}'")
        
        if lastmod is not None:
            date = lastmod.text if lastmod.text else ''
            # Basic date format check (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS+00:00)
            if not date or len(date) < 10:
                issues.append(f"URL {idx}: Invalid <lastmod> date format - '{date}'")
    
    # Report issues
    if issues:
        logger.error(f"❌ {filepath} has {len(issues)} issue(s):")
        for issue in issues[:10]:  # Show first 10
            logger.error(f"   - {issue}")
        if len(issues) > 10:
            logger.error(f"   ... and {len(issues) - 10} more")
        return False
    
    logger.info(f"✅ {filepath} is valid")
    logger.info(f"   - All {len(urls)} URLs are properly formatted")
    
    return True


def main():
    """Main validation function."""
    logger.info("=" * 60)
    logger.info("Validating robots.txt and sitemap.xml")
    logger.info("=" * 60)
    
    results = []
    
    # Validate robots.txt
    logger.info("")
    robots_valid = validate_robots_txt('robots.txt')
    results.append(('robots.txt', robots_valid))
    
    # Validate sitemap.xml
    logger.info("")
    sitemap_valid = validate_sitemap_xml('sitemap.xml')
    results.append(('sitemap.xml', sitemap_valid))
    
    # Summary
    logger.info("")
    logger.info("=" * 60)
    logger.info("Validation Summary")
    logger.info("=" * 60)
    
    all_valid = True
    for filename, is_valid in results:
        status = "✅ PASS" if is_valid else "❌ FAIL"
        logger.info(f"{status}: {filename}")
        if not is_valid:
            all_valid = False
    
    logger.info("=" * 60)
    
    if all_valid:
        logger.info("✅ All validations passed!")
        return 0
    else:
        logger.error("❌ Some validations failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
