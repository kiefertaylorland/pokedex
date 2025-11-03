#!/usr/bin/env python3
"""
Generate API documentation from JavaScript JSDoc comments.

This script parses JSDoc comments from JavaScript files and generates
markdown documentation for the API.
"""

import re
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class JSDocParser:
    """Parse JSDoc comments from JavaScript files."""
    
    def __init__(self):
        self.jsdoc_pattern = re.compile(
            r'/\*\*\s*(.*?)\s*\*/',
            re.DOTALL
        )
        self.export_pattern = re.compile(
            r'export\s+(class|function|const)\s+(\w+)'
        )
        
    def parse_file(self, filepath: Path) -> List[Dict[str, Any]]:
        """Parse a JavaScript file for JSDoc comments.
        
        Args:
            filepath: Path to JavaScript file
            
        Returns:
            List of dictionaries containing API information
        """
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            logger.error(f"Error reading {filepath}: {e}")
            return []
        
        exports = []
        
        # Find all exported items
        for match in self.export_pattern.finditer(content):
            export_type = match.group(1)
            export_name = match.group(2)
            
            # Find JSDoc comment before this export
            doc_end = match.start()
            doc_start = content.rfind('/**', 0, doc_end)
            
            if doc_start != -1:
                doc_comment = content[doc_start:doc_end]
                parsed_doc = self._parse_jsdoc(doc_comment)
                
                exports.append({
                    'name': export_name,
                    'type': export_type,
                    'file': str(filepath),
                    'doc': parsed_doc
                })
        
        return exports
    
    def _parse_jsdoc(self, doc_comment: str) -> Dict[str, Any]:
        """Parse JSDoc comment into structured data.
        
        Args:
            doc_comment: JSDoc comment string
            
        Returns:
            Dictionary with parsed information
        """
        lines = doc_comment.split('\n')
        
        description = []
        params = []
        returns = None
        tags = {}
        
        for line in lines:
            line = line.strip().lstrip('*').strip()
            
            if not line or line == '/**' or line == '*/':
                continue
            
            # Parse @tags
            if line.startswith('@'):
                parts = line.split(None, 1)
                tag = parts[0]
                value = parts[1] if len(parts) > 1 else ''
                
                if tag == '@param':
                    params.append(value)
                elif tag == '@returns' or tag == '@return':
                    returns = value
                else:
                    tags[tag] = value
            else:
                description.append(line)
        
        return {
            'description': ' '.join(description),
            'params': params,
            'returns': returns,
            'tags': tags
        }


def generate_markdown(exports: List[Dict[str, Any]], category: str) -> str:
    """Generate markdown documentation from exports.
    
    Args:
        exports: List of export dictionaries
        category: Category name (e.g., "Components", "Utilities")
        
    Returns:
        Markdown string
    """
    if not exports:
        return ""
    
    md = f"### {category}\n\n"
    
    for export in sorted(exports, key=lambda x: x['name']):
        name = export['name']
        export_type = export['type']
        file = export['file']
        doc = export['doc']
        
        # Header
        md += f"#### `{name}` ({export_type})\n\n"
        md += f"**File:** `{file}`\n\n"
        
        # Description
        if doc['description']:
            md += f"{doc['description']}\n\n"
        
        # Parameters
        if doc['params']:
            md += "**Parameters:**\n"
            for param in doc['params']:
                md += f"- {param}\n"
            md += "\n"
        
        # Returns
        if doc['returns']:
            md += f"**Returns:** {doc['returns']}\n\n"
        
        # Additional tags
        if doc['tags']:
            for tag, value in doc['tags'].items():
                tag_name = tag.lstrip('@').title()
                md += f"**{tag_name}:** {value}\n\n"
        
        md += "---\n\n"
    
    return md


def main():
    """Generate API documentation."""
    logger.info("Generating API documentation from JavaScript files...")
    
    parser = JSDocParser()
    js_root = Path('assets/js')
    
    if not js_root.exists():
        logger.error(f"JavaScript directory not found: {js_root}")
        return
    
    # Categorize modules
    categories = {
        'Components': js_root / 'components',
        'Managers': js_root / 'managers',
        'Controllers': js_root / 'controllers',
        'Utilities': js_root / 'utils'
    }
    
    all_exports = {}
    
    for category, path in categories.items():
        if not path.exists():
            logger.warning(f"Directory not found: {path}")
            continue
        
        category_exports = []
        
        for js_file in path.glob('*.js'):
            logger.info(f"Parsing {js_file}...")
            exports = parser.parse_file(js_file)
            category_exports.extend(exports)
        
        all_exports[category] = category_exports
        logger.info(f"Found {len(category_exports)} exports in {category}")
    
    # Generate markdown
    md_content = """# Pokédex JavaScript API Documentation

**Auto-generated from JSDoc comments**  
**Last Updated:** {timestamp}

This document provides API documentation for all exported JavaScript modules.

## Table of Contents
- [Components](#components)
- [Managers](#managers)
- [Controllers](#controllers)
- [Utilities](#utilities)

---

"""
    
    from datetime import datetime
    md_content = md_content.format(timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    
    # Add each category
    for category in ['Components', 'Managers', 'Controllers', 'Utilities']:
        if category in all_exports and all_exports[category]:
            md_content += f"## {category}\n\n"
            md_content += generate_markdown(all_exports[category], category)
    
    # Add footer
    md_content += """
## Related Documentation

- **Module Dependencies:** See `MODULE_DEPENDENCIES.md`
- **Data Schema:** See `DATA_SCHEMA.md`
- **Contributing:** See `CONTRIBUTING.md`
- **Architecture:** See `.github/copilot-instructions.md`

---

*This documentation is auto-generated. To update, run:*
```bash
python generate_api_docs.py
```
"""
    
    # Write to file
    output_file = Path('API.md')
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(md_content)
    
    logger.info(f"✅ API documentation generated: {output_file}")
    
    total_exports = sum(len(exports) for exports in all_exports.values())
    logger.info(f"Total exported items documented: {total_exports}")


if __name__ == "__main__":
    main()
