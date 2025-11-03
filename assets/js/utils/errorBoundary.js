/**
 * Error Boundary - Global error handler for the Pokedex application
 * 
 * Provides:
 * - User-friendly error messages
 * - Error logging
 * - Recovery mechanisms
 * - Graceful degradation
 */

/**
 * Error boundary configuration
 */
const ERROR_BOUNDARY_CONFIG = {
    showErrorDetails: false, // Set to true in development
    maxErrors: 10, // Maximum errors to track
    errorDisplayDuration: 5000, // 5 seconds
};

/**
 * Error tracking
 */
let errorCount = 0;
let errorLog = [];

/**
 * Show error notification to user
 * @param {string} message - User-friendly error message
 * @param {boolean} isRecoverable - Whether user can continue using the app
 */
function showErrorNotification(message, isRecoverable = true) {
    // Create error container if it doesn't exist
    let errorContainer = document.getElementById('error-boundary-container');
    
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.id = 'error-boundary-container';
        errorContainer.className = 'error-boundary-container';
        errorContainer.setAttribute('role', 'alert');
        errorContainer.setAttribute('aria-live', 'assertive');
        document.body.appendChild(errorContainer);
    }
    
    // Create error notification
    const notification = document.createElement('div');
    notification.className = `error-notification ${isRecoverable ? 'error-recoverable' : 'error-fatal'}`;
    
    const icon = isRecoverable ? '⚠️' : '❌';
    const title = isRecoverable ? 'Something went wrong' : 'Critical Error';
    
    notification.innerHTML = `
        <div class="error-notification-header">
            <span class="error-icon" aria-hidden="true">${icon}</span>
            <strong class="error-title">${title}</strong>
        </div>
        <p class="error-message">${message}</p>
        ${isRecoverable ? '<button class="error-dismiss-btn" aria-label="Dismiss error">Dismiss</button>' : 
          '<button class="error-reload-btn" aria-label="Reload page">Reload Page</button>'}
    `;
    
    errorContainer.appendChild(notification);
    
    // Add event listeners
    const dismissBtn = notification.querySelector('.error-dismiss-btn');
    const reloadBtn = notification.querySelector('.error-reload-btn');
    
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-dismiss after duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, ERROR_BOUNDARY_CONFIG.errorDisplayDuration);
    }
    
    if (reloadBtn) {
        reloadBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }
}

/**
 * Log error details (could send to external service in production)
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 */
function logError(error, context) {
    const errorEntry = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        context: context,
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    errorLog.push(errorEntry);
    
    // Keep only last N errors
    if (errorLog.length > ERROR_BOUNDARY_CONFIG.maxErrors) {
        errorLog.shift();
    }
    
    // In production, you could send this to an error tracking service:
    // sendToErrorTrackingService(errorEntry);
    
    if (ERROR_BOUNDARY_CONFIG.showErrorDetails) {
        console.group('🚨 Error Boundary');
        console.error('Error:', error);
        console.log('Context:', context);
        console.log('Full error log:', errorLog);
        console.groupEnd();
    }
}

/**
 * Get user-friendly error message based on error type
 * @param {Error} error - Error object
 * @returns {string} User-friendly message
 */
function getUserFriendlyMessage(error) {
    const errorMessage = error.message.toLowerCase();
    
    // Network errors
    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        return 'Unable to load data. Please check your internet connection and try again.';
    }
    
    // Data errors
    if (errorMessage.includes('json') || errorMessage.includes('parse')) {
        return 'There was a problem loading Pokémon data. Please refresh the page.';
    }
    
    // DOM errors
    if (errorMessage.includes('null') || errorMessage.includes('undefined')) {
        return 'A display issue occurred. The page may need to be refreshed.';
    }
    
    // Generic error
    return 'An unexpected error occurred. Please try again or refresh the page.';
}

/**
 * Handle global JavaScript errors
 */
window.addEventListener('error', (event) => {
    errorCount++;
    
    // Prevent infinite error loops
    if (errorCount > ERROR_BOUNDARY_CONFIG.maxErrors) {
        console.error('Too many errors. Stopping error handling.');
        return;
    }
    
    const error = event.error || new Error(event.message);
    const context = `${event.filename}:${event.lineno}:${event.colno}`;
    
    logError(error, context);
    
    const userMessage = getUserFriendlyMessage(error);
    const isRecoverable = errorCount < 5; // Consider fatal after 5 errors
    
    showErrorNotification(userMessage, isRecoverable);
    
    // Prevent default error handling in console for cleaner output
    if (!ERROR_BOUNDARY_CONFIG.showErrorDetails) {
        event.preventDefault();
    }
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    errorCount++;
    
    if (errorCount > ERROR_BOUNDARY_CONFIG.maxErrors) {
        console.error('Too many errors. Stopping error handling.');
        return;
    }
    
    const error = event.reason instanceof Error ? 
        event.reason : 
        new Error(String(event.reason));
    
    logError(error, 'Unhandled Promise Rejection');
    
    const userMessage = getUserFriendlyMessage(error);
    showErrorNotification(userMessage, true);
    
    // Prevent default (console error)
    if (!ERROR_BOUNDARY_CONFIG.showErrorDetails) {
        event.preventDefault();
    }
});

/**
 * Add CSS styles for error notifications
 */
function injectErrorBoundaryStyles() {
    const styleId = 'error-boundary-styles';
    
    // Don't inject twice
    if (document.getElementById(styleId)) {
        return;
    }
    
    const styles = document.createElement('style');
    styles.id = styleId;
    styles.textContent = `
        .error-boundary-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        }
        
        .error-notification {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 16px;
            margin-bottom: 12px;
            border-left: 4px solid #f44336;
            animation: slideInRight 0.3s ease-out;
        }
        
        .error-notification.error-fatal {
            border-left-color: #d32f2f;
            background: #ffebee;
        }
        
        .error-notification-header {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .error-icon {
            font-size: 20px;
            margin-right: 8px;
        }
        
        .error-title {
            font-size: 16px;
            color: #333;
            margin: 0;
        }
        
        .error-message {
            color: #666;
            font-size: 14px;
            margin: 0 0 12px 0;
            line-height: 1.5;
        }
        
        .error-dismiss-btn,
        .error-reload-btn {
            background: #f44336;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 16px;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .error-dismiss-btn:hover {
            background: #d32f2f;
        }
        
        .error-reload-btn {
            background: #d32f2f;
        }
        
        .error-reload-btn:hover {
            background: #b71c1c;
        }
        
        .error-dismiss-btn:focus,
        .error-reload-btn:focus {
            outline: 2px solid #f44336;
            outline-offset: 2px;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        /* Dark theme support */
        [data-theme="dark"] .error-notification {
            background: #1e1e1e;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }
        
        [data-theme="dark"] .error-title {
            color: #e0e0e0;
        }
        
        [data-theme="dark"] .error-message {
            color: #b0b0b0;
        }
        
        [data-theme="dark"] .error-notification.error-fatal {
            background: #2a1a1a;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
            .error-boundary-container {
                top: 10px;
                right: 10px;
                left: 10px;
                max-width: none;
            }
        }
    `;
    
    document.head.appendChild(styles);
}

/**
 * Initialize error boundary
 */
function initErrorBoundary() {
    injectErrorBoundaryStyles();
    
    // Enable detailed errors in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        ERROR_BOUNDARY_CONFIG.showErrorDetails = true;
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initErrorBoundary);
} else {
    initErrorBoundary();
}

/**
 * Export error boundary utilities for manual error handling
 */
export {
    showErrorNotification,
    logError,
    getUserFriendlyMessage
};
