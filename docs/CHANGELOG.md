# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Documentation Suite** (7 new files)
  - CONTRIBUTING.md with comprehensive contribution guidelines
  - CHANGELOG.md for tracking project changes (this file)
  - MODULE_DEPENDENCIES.md documenting frontend architecture and data flow
  - Auto-generated API.md from JSDoc comments (38 exports documented)
  - ESLint configuration (.eslintrc.json) for code quality
  - package.json for Node.js tooling and version management
  - VERSION file tracking current release (1.1.0)

- **Error Handling & UX**
  - Global error boundary (assets/js/utils/errorBoundary.js)
  - User-friendly error notifications with recovery options
  - Keyboard shortcuts help modal (press '?' to show)
  - Global keyboard shortcuts (T=theme, L=language, S=sort, /=search)

- **Security & Performance**
  - Comprehensive Content Security Policy headers
  - Rate limiting for PokéAPI requests (RateLimiter class)
  - Input sanitization and XSS prevention (existing security.js)

- **Developer Tools**
  - generate_type_effectiveness.py - Auto-generates JS from Python data
  - generate_api_docs.py - Generates API documentation from JSDoc
  - validate_seo_files.py - Validates robots.txt and sitemap.xml
  - Enhanced .pre-commit-config.yaml with Black, Flake8, and validators
  - npm scripts for linting, testing, and validation
  - ESLint configuration for JavaScript code quality

- **CI/CD Improvements**
  - Pre-deploy testing in GitHub Actions workflow
  - SEO files validation before deployment
  - Python syntax checking in CI pipeline

### Changed
- **README.md** - Expanded feature list with all capabilities
  - Added comparison, team builder, URL routing, structured data
  - Organized into Core Features and Advanced Features sections
  
- **Type Effectiveness** - Eliminated duplication
  - Single source of truth in Python
  - Auto-generated JavaScript file
  - Helper functions included

- **Dependencies**
  - Added black, flake8, pre-commit to requirements.txt
  - Added eslint to package.json devDependencies

- **Module Organization**
  - Documented clear dependency hierarchy
  - Event-driven communication patterns
  - Prevention of circular dependencies

### Fixed
- Cleaned up backup files (pokedex_data_original_backup.json, pokedex_data.json.backup)
- Standardized .gitignore configuration
- Configured code quality tools for consistent style

### Removed
- Redundant type effectiveness data duplication
- Unused backup files from repository

## [1.1.0] - 2025-11-02

### Added
- Comprehensive data schema documentation (DATA_SCHEMA.md)
- Documentation for PokéAPI module purposes (POKEAPI_MODULES.md)
- Documentation for data file variants (DATA_FILES.md)
- Known test failures documentation (KNOWN_TEST_FAILURES.md)
- Data validation in pokeapi_fetch.py with 19 field checks
- Command-line arguments for pokeapi_fetch.py (--count, --output, --sleep)
- Type hints to core Python modules (pokeapi.py, pokeapi_fetch.py)
- Python logging framework across all scripts
- Shared pytest fixtures in tests/conftest.py
- Test coverage reporting with coverage package

### Changed
- Refactored service-worker.js to use async/await pattern consistently
- Moved test_evolution_manual.py to tests/ directory
- Improved test infrastructure with centralized server management
- Enhanced copilot-instructions.md with detailed architecture documentation

### Fixed
- Removed outdated IMPORTANT_DATA_UPDATE_REQUIRED.md reference from README
- Removed excessive console.log statements from production code
- Fixed duplicate server management code across test files
- Fixed port conflicts in test files with dynamic port allocation
- Resolved hardcoded Pokemon count issue

### Removed
- Debug console.log statements from service-worker.js, imageUtils.js, searchController.js
- Duplicate HTTP server setup code from individual test files

## [1.0.0] - 2025-11-01

### Added
- Initial release with all 1025 Pokémon (Generations I-IX)
- Bilingual support (English/Japanese with romaji)
- Light and dark theme toggle
- Advanced search and filtering by name, ID, or type
- Pokémon comparison feature
- Team builder (up to 6 Pokémon)
- Evolution chain visualization
- Type matchup chart
- Complete move details
- Deep linking support for shareable URLs
- SEO optimization with structured data
- Progressive Web App with offline support
- Full keyboard navigation
- Screen reader accessibility
- Responsive design for all devices
- Pokémon cries audio

### Technical
- Vanilla JavaScript ES6 modules
- Python 3.12+ scripts for data processing
- Service worker for offline caching
- Selenium-based integration tests
- GitHub Pages deployment
- PokéAPI data integration

---

## Version History

- **1.1.0** - Documentation improvements, testing infrastructure, code quality
- **1.0.0** - Initial public release with all core features

## Migration Guide

### Upgrading from 1.0.0 to 1.1.0

No breaking changes. This release focuses on documentation, testing, and code quality improvements.

1. Pull latest changes
2. Reinstall dependencies: `pip install -r requirements.txt`
3. Review new documentation files (DATA_SCHEMA.md, CONTRIBUTING.md, etc.)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Support

- Report bugs: [GitHub Issues](https://github.com/kiefertaylorland/pokedex/issues)
- Documentation: See README.md and .github/copilot-instructions.md
- Live demo: [www.pokedex.tech](https://www.pokedex.tech)
