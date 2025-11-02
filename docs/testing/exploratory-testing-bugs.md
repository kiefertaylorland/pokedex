# GitHub Issues to Create

## Issue 1: All Pokemon Images Fail to Load (ERR_BLOCKED_BY_CLIENT)

**Title:** Critical: Pokemon images not loading - ERR_BLOCKED_BY_CLIENT error

**Labels:** `bug`, `critical`, `ui`

**Description:**

### Bug Description
All Pokemon images from #001-#042 fail to load, showing "No Image" placeholder with warning icon. Browser console shows `ERR_BLOCKED_BY_CLIENT` errors when trying to fetch images from `raw.githubusercontent.com`.

### Steps to Reproduce
1. Open the Pokédex homepage
2. Observe the first 42 Pokemon cards (Bulbasaur through Golbat)
3. Open browser DevTools Console

### Expected Behavior
- All Pokemon should display their official sprites
- Images should load successfully from the CDN

### Actual Behavior
- Pokemon #001-042 show yellow warning triangle with "No Image" text
- Console shows multiple `ERR_BLOCKED_BY_CLIENT` errors
- Images from #043 onwards load correctly

### Environment
- Browser: Chrome/Edge (Chromium-based)
- URL: http://localhost:8000

### Technical Details
```
Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
URL: https://raw.githubusercontent.com/...
```

### Impact
- Users cannot visually identify the first 42 Pokemon
- Significantly degrades user experience
- Makes the Pokedex less useful for identification purposes

### Possible Causes
1. Ad blocker or content blocker interference
2. CORS configuration issues
3. Rate limiting from githubusercontent.com
4. Mixed content (HTTP/HTTPS) issues

---

## Issue 2: Pokemon Names Show as "Pokemon0026" Instead of Actual Names in Evolution Chain

**Title:** Bug: Evolution chain displays Pokemon ID instead of name (e.g., "Pokemon0026" instead of "Raichu")

**Labels:** `bug`, `data`, `ui`

**Description:**

### Bug Description
In the Pokemon detail modal, the evolution chain section displays Pokemon identifiers (e.g., "Pokemon0026") instead of their actual names (e.g., "Raichu").

### Steps to Reproduce
1. Navigate to the Pokédex homepage
2. Search for "pikachu" in the search box
3. Click on the Pikachu card to open the detail modal
4. Look at the "Evolution Chain" section

### Expected Behavior
- Evolution chain should display: "Pichu → Pikachu → **Raichu**"
- Pokemon names should be human-readable

### Actual Behavior
- Evolution chain displays: "Pichu → Pikachu → **Pokemon0026**"
- Shows raw identifier instead of resolved Pokemon name

### Environment
- Component: Pokemon Detail Modal
- Affected: All Pokemon with evolutions

### Technical Details
This appears to be a data mapping issue where Pokemon names aren't being properly resolved from their numerical IDs. The evolution data likely returns Pokemon IDs (26 for Raichu) but the display logic isn't converting these to names.

### Impact
- Medium severity
- Confusing for users trying to learn evolution paths
- Reduces educational value of the Pokedex

---

## Issue 3: Pokemon Moves Data Not Loading - Shows "No specific moves data available"

**Title:** Bug: Moves section empty - displays "No specific moves data available" for all Pokemon

**Labels:** `bug`, `data`, `feature`

**Description:**

### Bug Description
The Moves section in the Pokemon detail modal shows placeholder text "No specific moves data available" instead of displaying the Pokemon's actual moveset.

### Steps to Reproduce
1. Navigate to the Pokédex homepage
2. Click on any Pokemon card (tested with Pikachu, Bulbasaur)
3. Scroll to the "Moves" section in the detail modal

### Expected Behavior
- Should display a list of moves the Pokemon can learn
- Moves should include move names and possibly levels/methods

### Actual Behavior
- Shows placeholder message: "No specific moves data available"
- No moves are displayed for any Pokemon

### Environment
- Component: Pokemon Detail Modal - Moves Section
- Affected: All Pokemon

### Technical Details
This could be caused by:
1. Moves data not being fetched from the PokeAPI
2. API endpoint not being called
3. Data parsing error
4. Missing implementation

### Impact
- Medium-High severity
- Significant feature gap - moves are core Pokemon data
- Users cannot see what moves Pokemon learn
- Reduces utility as a reference tool

---

## Issue 4: Application Shows All 1025+ Pokemon Despite Being Labeled "Generation 1" (Should Only Show #001-151)

**Title:** Bug: Scope mismatch - App labeled "Generation 1" but displays all generations (#001-1025+)

**Labels:** `bug`, `data-filtering`, `scope`

**Description:**

### Bug Description
The application is titled "Pokédex - Interactive **Generation 1** Pokemon Database" but actually displays Pokemon from ALL generations (#001-1025+), not just Generation 1 (#001-151).

### Steps to Reproduce
1. Open the Pokédex
2. Note the page title: "Interactive Generation 1 Pokemon Database"  
3. Search for "fire" type or scroll down
4. Observe Pokemon from Gen 2+ (e.g., Cyndaquil #155, Gen 8-9 Pokemon)

### Expected Behavior
**Option A:** If truly Gen 1 only:
- Only display Pokemon #001-151 (Bulbasaur through Mew)
- Filter out all Gen 2+ Pokemon

**Option B:** If supporting all generations:
- Update title/description to reflect "All Generations" or "Complete Pokédex"
- Remove "Generation 1" branding

### Actual Behavior
- Title says "Generation 1"
- Data includes all 1025+ Pokemon from Generations 1-9
- Creates confusion about the app's scope

### Environment
- Affects: Homepage, Search Results, All Views
- Title Location: Browser tab, page header

### Impact
- High severity
- False advertising/misleading branding
- User confusion
- Scope creep from original "Generation 1" concept

### Recommendation
Choose one approach:
1. **Filter to Gen 1 only** (recommended if the goal is a focused Gen 1 Pokedex)
2. **Update branding** to reflect full multi-generation support

---

## Issue 5: Pokemon #899-1025 Display Generic Names ("ポケモン899") and Incorrect Type Data

**Title:** Critical: Missing data for Pokemon #899-1025 - showing placeholders instead of actual Pokemon information

**Labels:** `bug`, `critical`, `data`, `missing-content`

**Description:**

### Bug Description
Pokemon numbered #899 through #1025 display generic placeholder names (e.g., "ポケモン899", "ポケモン900") with incorrect "ノーマル" (Normal) typing instead of their actual Pokemon names and correct type information.

### Steps to Reproduce
1. Navigate to the Pokédex homepage
2. Scroll down to the bottom of the Pokemon list
3. Observe Pokemon #899 onwards

### Expected Behavior
- Should display actual Pokemon names (e.g., "Wyrdeer" for #899, "Kleavor" for #900)
- Should show correct Pokemon types
- Should have complete Pokemon data

### Actual Behavior
- Pokemon show as "ポケモン899", "ポケモン900", etc.
- All incorrectly typed as "ノーマル" (Normal)
- Missing actual Pokemon identification data

### Environment
- Affected Pokemon: #899-1025 (Gen 8-9 Pokemon from Legends: Arceus and Scarlet/Violet)
- Data Language: Japanese (ポケモン)

### Examples
| Number | Shows As | Should Be |
|--------|----------|-----------|
| #899 | ポケモン899 | Wyrdeer (アヤシシ) |
| #900 | ポケモン900 | Kleavor (バサギリ) |
| #1025 | ポケモン1025 | Pecharunt (モモワロウ) |

### Technical Details
Possible causes:
1. Incomplete data source for Gen 8-9 Pokemon
2. Missing Japanese translations in the dataset
3. PokeAPI data not fully loaded
4. Data fetching stops/fails partway through

### Impact
- **Critical severity**
- Makes Pokedex completely unusable for identifying modern Pokemon
- 127+ Pokemon affected (#899-1025)
- Users cannot look up or identify these Pokemon
- Significantly reduces value as a reference tool

### Suggested Fix
1. Verify data source includes complete Pokemon data through #1025
2. Ensure Japanese translations are available
3. Add error handling for missing data
4. Consider fallback to English names if Japanese unavailable
5. Add data validation to catch placeholder content

---

