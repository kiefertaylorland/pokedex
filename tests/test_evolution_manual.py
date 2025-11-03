#!/usr/bin/env python3
"""
Manual test script to verify evolution chains are working
"""
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Initialize Chrome WebDriver
chrome_options = Options()
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--window-size=1920,1080")

driver = webdriver.Chrome(options=chrome_options)

try:
    # Open the application
    driver.get("http://localhost:8003")
    
    # Wait for Pokemon cards to load
    WebDriverWait(driver, 10).until(
        lambda d: len(d.find_elements(By.CLASS_NAME, "pokemon-card")) > 0
    )
    
    # Find and click Charmander (#4)
    cards = driver.find_elements(By.CLASS_NAME, "pokemon-card")
    charmander_card = None
    for card in cards:
        if "Charmander" in card.text or "#004" in card.text:
            charmander_card = card
            break
    
    if not charmander_card:
        print("ERROR: Charmander card not found")
        exit(1)
    
    print("✓ Found Charmander card")
    charmander_card.click()
    
    # Wait for detail view to appear
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "pokemon-detail-view"))
    )
    print("✓ Detail view opened")
    
    # Wait for evolution chain to load
    time.sleep(1)  # Give it a moment to render
    
    # Check for evolution tree
    try:
        evolution_tree = driver.find_element(By.CLASS_NAME, "evolution-tree")
        print("✓ Evolution tree found")
        
        # Get all evolution stages
        evolution_stages = driver.find_elements(By.CLASS_NAME, "evolution-stage")
        print(f"✓ Found {len(evolution_stages)} evolution stages")
        
        # Print evolution chain
        evolution_names = []
        for stage in evolution_stages:
            name_elem = stage.find_element(By.CLASS_NAME, "evolution-name")
            evolution_names.append(name_elem.text)
        
        print(f"✓ Evolution chain: {' → '.join(evolution_names)}")
        
        # Verify we have the complete chain
        expected = ["Charmander", "Charmeleon", "Charizard"]
        if evolution_names == expected:
            print("✅ SUCCESS: Evolution chain is complete and correct!")
        else:
            print(f"❌ FAILED: Expected {expected}, got {evolution_names}")
            
        # Test clicking on an evolution
        clickable_stages = [s for s in evolution_stages if s.get_attribute('role') == 'button']
        if clickable_stages:
            print(f"✓ Found {len(clickable_stages)} clickable evolution stages")
            
            # Click on the first clickable stage (should be Charmeleon)
            first_clickable = clickable_stages[0]
            evolution_name = first_clickable.find_element(By.CLASS_NAME, "evolution-name").text
            print(f"  Clicking on {evolution_name}...")
            first_clickable.click()
            
            # Wait a moment for the view to update
            time.sleep(1)
            
            # Check if the detail view updated
            detail_name = driver.find_element(By.CLASS_NAME, "pokemon-detail-name").text
            if evolution_name in detail_name:
                print(f"✅ SUCCESS: Detail view updated to {evolution_name}!")
            else:
                print(f"❌ FAILED: Expected {evolution_name} in detail, got {detail_name}")
        else:
            print("⚠️  WARNING: No clickable evolution stages found")
            
    except Exception as e:
        print(f"❌ ERROR: Could not find evolution tree: {e}")
        
        # Try to find evolution chain (old style)
        try:
            evolution_chain = driver.find_element(By.CLASS_NAME, "evolution-chain-list")
            print("  Found old-style evolution chain instead")
        except:
            print("  No evolution chain found at all!")
    
    print("\n✅ Manual test completed successfully!")
    
except Exception as e:
    print(f"❌ Test failed with error: {e}")
    import traceback
    traceback.print_exc()
    
finally:
    input("\nPress Enter to close browser...")
    driver.quit()
