/**
 * Environment Configuration Utility
 * @module Config
 * 
 * Provides environment-specific configuration for development vs production
 */

/**
 * Environment types
 */
export const ENV = {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    TEST: 'test'
};

/**
 * Detects the current environment
 * @returns {string} Current environment (development, production, or test)
 */
export function detectEnvironment() {
    // Check for test environment
    if (window.location.hostname === 'localhost' && window.location.port === '8000') {
        return ENV.TEST;
    }
    
    // Check for development environment
    if (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '' ||
        window.location.protocol === 'file:'
    ) {
        return ENV.DEVELOPMENT;
    }
    
    // Production environment
    return ENV.PRODUCTION;
}

/**
 * Configuration object
 */
class Configuration {
    constructor() {
        this.environment = detectEnvironment();
        this._config = this._getConfig();
    }

    /**
     * Gets environment-specific configuration
     * @private
     * @returns {Object} Configuration object
     */
    _getConfig() {
        const baseConfig = {
            appName: 'Pokédex',
            version: '1.1.0',
            apiUrl: 'https://pokeapi.co/api/v2',
            cacheVersion: 'v1.1.0',
        };

        const developmentConfig = {
            ...baseConfig,
            debug: true,
            enableConsoleLogging: true,
            enablePerformanceMetrics: true,
            enableServiceWorker: false,
            cacheStrategy: 'network-first',
            errorReporting: false,
            analyticsEnabled: false,
        };

        const productionConfig = {
            ...baseConfig,
            debug: false,
            enableConsoleLogging: false,
            enablePerformanceMetrics: false,
            enableServiceWorker: true,
            cacheStrategy: 'cache-first',
            errorReporting: true,
            analyticsEnabled: true,
        };

        const testConfig = {
            ...baseConfig,
            debug: true,
            enableConsoleLogging: true,
            enablePerformanceMetrics: false,
            enableServiceWorker: false,
            cacheStrategy: 'network-only',
            errorReporting: false,
            analyticsEnabled: false,
        };

        switch (this.environment) {
            case ENV.DEVELOPMENT:
                return developmentConfig;
            case ENV.PRODUCTION:
                return productionConfig;
            case ENV.TEST:
                return testConfig;
            default:
                return productionConfig;
        }
    }

    /**
     * Gets a configuration value
     * @param {string} key - Configuration key
     * @returns {*} Configuration value
     */
    get(key) {
        return this._config[key];
    }

    /**
     * Gets all configuration
     * @returns {Object} Complete configuration object
     */
    getAll() {
        return { ...this._config };
    }

    /**
     * Checks if in development mode
     * @returns {boolean} True if in development
     */
    isDevelopment() {
        return this.environment === ENV.DEVELOPMENT;
    }

    /**
     * Checks if in production mode
     * @returns {boolean} True if in production
     */
    isProduction() {
        return this.environment === ENV.PRODUCTION;
    }

    /**
     * Checks if in test mode
     * @returns {boolean} True if in test
     */
    isTest() {
        return this.environment === ENV.TEST;
    }

    /**
     * Logs a message if debugging is enabled
     * @param {...any} args - Arguments to log
     */
    log(...args) {
        if (this._config.enableConsoleLogging) {
            console.log('[Config]', ...args);
        }
    }

    /**
     * Logs an error (always logged regardless of environment)
     * @param {...any} args - Arguments to log
     */
    error(...args) {
        console.error('[Config]', ...args);
    }

    /**
     * Logs a warning if debugging is enabled
     * @param {...any} args - Arguments to log
     */
    warn(...args) {
        if (this._config.enableConsoleLogging) {
            console.warn('[Config]', ...args);
        }
    }

    /**
     * Measures performance if enabled
     * @param {string} label - Performance label
     * @param {Function} fn - Function to measure
     * @returns {Promise<*>} Result of the function
     */
    async measurePerformance(label, fn) {
        if (!this._config.enablePerformanceMetrics) {
            return await fn();
        }

        const startTime = performance.now();
        try {
            const result = await fn();
            const endTime = performance.now();
            this.log(`⏱️ ${label}: ${(endTime - startTime).toFixed(2)}ms`);
            return result;
        } catch (error) {
            const endTime = performance.now();
            this.error(`⏱️ ${label} failed after ${(endTime - startTime).toFixed(2)}ms:`, error);
            throw error;
        }
    }

    /**
     * Reports an error to external service (if enabled)
     * @param {Error} error - Error to report
     * @param {Object} context - Additional context
     */
    reportError(error, context = {}) {
        if (!this._config.errorReporting) {
            return;
        }

        // Placeholder for error reporting service integration
        // In production, this could send to Sentry, LogRocket, etc.
        this.error('Error reported:', error, context);
        
        // Example integration point:
        // if (window.Sentry) {
        //     window.Sentry.captureException(error, { extra: context });
        // }
    }
}

// Singleton instance
let configInstance = null;

/**
 * Gets the singleton configuration instance
 * @returns {Configuration} Configuration instance
 */
export function getConfig() {
    if (!configInstance) {
        configInstance = new Configuration();
        
        // Log environment on first access
        configInstance.log(`Running in ${configInstance.environment} mode`);
        configInstance.log('Configuration:', configInstance.getAll());
    }
    return configInstance;
}

// Export singleton for convenience
export const config = getConfig();
