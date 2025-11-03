#!/usr/bin/env python3
"""
Generate sitemap.xml for the Pokedex website
This script creates a sitemap with all Pokemon URLs for better SEO
"""

import json
from datetime import datetime
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


def generate_sitemap():
    """Generate sitemap.xml with all Pokemon URLs"""
    
    base_url = "https://www.pokedex.tech"
    
    # Load Pokemon data
    data_file = Path(__file__).parent / "pokedex_data.json"
    
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            pokemon_data = json.load(f)
    except FileNotFoundError:
        logger.error(f"Error: {data_file} not found. Run pokeapi_fetch.py first.")
        return False
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing JSON: {e}")
        return False
    
    # Start sitemap XML
    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>']
    sitemap.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # Get current date for lastmod
    today = datetime.now().strftime('%Y-%m-%d')
    
    # Add main page
    sitemap.append('  <url>')
    sitemap.append(f'    <loc>{base_url}/</loc>')
    sitemap.append(f'    <lastmod>{today}</lastmod>')
    sitemap.append('    <changefreq>weekly</changefreq>')
    sitemap.append('    <priority>1.0</priority>')
    sitemap.append('  </url>')
    
    # Add Pokemon pages
    for pokemon in pokemon_data:
        pokemon_id = pokemon.get('id')
        pokemon_name = pokemon.get('name_en', '').lower().replace(' ', '-').replace('.', '')
        
        if not pokemon_id or not pokemon_name:
            continue
        
        # Create URL with Pokemon ID and name slug
        pokemon_url = f"{base_url}/#pokemon/{pokemon_id}/{pokemon_name}"
        
        sitemap.append('  <url>')
        sitemap.append(f'    <loc>{pokemon_url}</loc>')
        sitemap.append(f'    <lastmod>{today}</lastmod>')
        sitemap.append('    <changefreq>monthly</changefreq>')
        sitemap.append('    <priority>0.8</priority>')
        sitemap.append('  </url>')
    
    sitemap.append('</urlset>')
    
    # Write sitemap to file
    sitemap_file = Path(__file__).parent / "sitemap.xml"
    
    try:
        with open(sitemap_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(sitemap))
        
        logger.info(f"✅ Generated sitemap.xml with {len(pokemon_data) + 1} URLs")
        logger.info(f"   Location: {sitemap_file}")
        return True
        
    except IOError as e:
        logger.error(f"Error writing sitemap: {e}")
        return False


if __name__ == "__main__":
    success = generate_sitemap()
    exit(0 if success else 1)
