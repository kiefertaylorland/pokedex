/**
 * Keyboard Shortcuts Help Modal
 * 
 * Displays keyboard shortcuts when user presses '?' key
 * Provides comprehensive list of all keyboard navigation options
 */

import { ELEMENT_IDS } from '../constants.js';

export class KeyboardShortcutsModal {
    constructor() {
        this.modal = null;
        this.isVisible = false;
        this.init();
    }
    
    /**
     * Initialize keyboard shortcuts modal
     */
    init() {
        this.createModal();
        this.attachEventListeners();
    }
    
    /**
     * Create modal HTML structure
     */
    createModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'keyboard-shortcuts-modal';
        this.modal.className = 'modal keyboard-shortcuts-modal';
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-labelledby', 'shortcuts-modal-title');
        this.modal.setAttribute('aria-modal', 'true');
        this.modal.style.display = 'none';
        
        this.modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content keyboard-shortcuts-content">
                <div class="modal-header">
                    <h2 id="shortcuts-modal-title">⌨️ Keyboard Shortcuts</h2>
                    <button 
                        class="close-btn" 
                        aria-label="Close keyboard shortcuts"
                        id="shortcuts-close-btn"
                    >
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="shortcuts-section">
                        <h3>General Navigation</h3>
                        <dl class="shortcuts-list">
                            <div class="shortcut-item">
                                <dt><kbd>?</kbd></dt>
                                <dd>Show/hide this help menu</dd>
                            </div>
                            <div class="shortcut-item">
                                <dt><kbd>Tab</kbd></dt>
                                <dd>Navigate to next interactive element</dd>
                            </div>
                            <div class="shortcut-item">
                                <dt><kbd>Shift</kbd> + <kbd>Tab</kbd></dt>
                                <dd>Navigate to previous interactive element</dd>
                            </div>
                            <div class="shortcut-item">
                                <dt><kbd>Esc</kbd></dt>
                                <dd>Close modals and detail views</dd>
                            </div>
                        </dl>
                    </div>
                    
                    <div class="shortcuts-section">
                        <h3>Search & Filtering</h3>
                        <dl class="shortcuts-list">
                            <div class="shortcut-item">
                                <dt><kbd>/</kbd></dt>
                                <dd>Focus search input</dd>
                            </div>
                            <div class="shortcut-item">
                                <dt><kbd>Ctrl</kbd> + <kbd>F</kbd> or <kbd>Cmd</kbd> + <kbd>F</kbd></dt>
                                <dd>Focus search input (alternative)</dd>
                            </div>
                            <div class="shortcut-item">
                                <dt><kbd>Enter</kbd></dt>
                                <dd>Select focused Pokémon card</dd>
                            </div>
                        </dl>
                    </div>
                    
                    <div class="shortcuts-section">
                        <h3>Pokémon Cards</h3>
                        <dl class="shortcuts-list">
                            <div class="shortcut-item">
                                <dt><kbd>Arrow Keys</kbd></dt>
                                <dd>Navigate between cards</dd>
                            </div>
                            <div class="shortcut-item">
                                <dt><kbd>Enter</kbd> or <kbd>Space</kbd></dt>
                                <dd>Open selected Pokémon details</dd>
                            </div>
                            <div class="shortcut-item">
                                <dt><kbd>Home</kbd></dt>
                                <dd>Jump to first Pokémon</dd>
                            </div>
                            <div class="shortcut-item">
                                <dt><kbd>End</kbd></dt>
                                <dd>Jump to last Pokémon</dd>
                            </div>
                        </dl>
                    </div>
                    
                    <div class="shortcuts-section">
                        <h3>Detail View</h3>
                        <dl class="shortcuts-list">
                            <div class="shortcut-item">
                                <dt><kbd>Esc</kbd></dt>
                                <dd>Close detail view</dd>
                            </div>
                            <div class="shortcut-item">
                                <dt><kbd>Tab</kbd></dt>
                                <dd>Navigate through tabs and sections</dd>
                            </div>
                            <div class="shortcut-item">
                                <dt><kbd>Enter</kbd></dt>
                                <dd>Activate buttons and links</dd>
                            </div>
                        </dl>
                    </div>
                    
                    <div class="shortcuts-section">
                        <h3>Controls</h3>
                        <dl class="shortcuts-list">
                            <div class="shortcut-item">
                                <dt><kbd>T</kbd></dt>
                                <dd>Toggle light/dark theme</dd>
                            </div>
                            <div class="shortcut-item">
                                <dt><kbd>L</kbd></dt>
                                <dd>Toggle language (English/Japanese)</dd>
                            </div>
                            <div class="shortcut-item">
                                <dt><kbd>S</kbd></dt>
                                <dd>Change sort order</dd>
                            </div>
                        </dl>
                    </div>
                    
                    <div class="shortcuts-tip">
                        <p><strong>💡 Tip:</strong> All interactive elements can be accessed via keyboard. 
                        Use <kbd>Tab</kbd> to navigate and <kbd>Enter</kbd> to activate.</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Press '?' to toggle modal
        document.addEventListener('keydown', (e) => {
            // Don't trigger if user is typing in an input
            if (e.target.matches('input, textarea')) {
                return;
            }
            
            if (e.key === '?' || (e.shiftKey && e.key === '/')) {
                e.preventDefault();
                this.toggle();
            }
            
            // Keyboard shortcuts
            if (!this.isVisible && !e.target.matches('input, textarea')) {
                this.handleGlobalShortcuts(e);
            }
        });
        
        // Close button
        const closeBtn = this.modal.querySelector('#shortcuts-close-btn');
        closeBtn.addEventListener('click', () => this.hide());
        
        // Close on backdrop click
        const backdrop = this.modal.querySelector('.modal-backdrop');
        backdrop.addEventListener('click', () => this.hide());
        
        // Close on Escape key
        this.modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
        });
        
        // Trap focus within modal
        this.modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.trapFocus(e);
            }
        });
    }
    
    /**
     * Handle global keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleGlobalShortcuts(e) {
        switch(e.key.toLowerCase()) {
            case 't':
                // Toggle theme
                const themeToggle = document.getElementById(ELEMENT_IDS.THEME_TOGGLE);
                if (themeToggle) {
                    e.preventDefault();
                    themeToggle.click();
                }
                break;
                
            case 'l':
                // Toggle language
                const langToggle = document.getElementById(ELEMENT_IDS.LANGUAGE_TOGGLE);
                if (langToggle) {
                    e.preventDefault();
                    langToggle.click();
                }
                break;
                
            case 's':
                // Focus sort dropdown
                const sortSelect = document.getElementById(ELEMENT_IDS.SORT_SELECT);
                if (sortSelect) {
                    e.preventDefault();
                    sortSelect.focus();
                }
                break;
                
            case '/':
                // Focus search
                const searchInput = document.getElementById(ELEMENT_IDS.SEARCH_INPUT);
                if (searchInput) {
                    e.preventDefault();
                    searchInput.focus();
                }
                break;
        }
    }
    
    /**
     * Trap focus within modal
     * @param {KeyboardEvent} e - Keyboard event
     */
    trapFocus(e) {
        const focusableElements = this.modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
    
    /**
     * Show modal
     */
    show() {
        this.modal.style.display = 'block';
        this.isVisible = true;
        
        // Focus close button
        setTimeout(() => {
            this.modal.querySelector('#shortcuts-close-btn').focus();
        }, 100);
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Hide modal
     */
    hide() {
        this.modal.style.display = 'none';
        this.isVisible = false;
        
        // Restore body scrolling
        document.body.style.overflow = '';
    }
    
    /**
     * Toggle modal visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

// Add styles for keyboard shortcuts modal
const styles = document.createElement('style');
styles.textContent = `
    .keyboard-shortcuts-modal .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9998;
    }
    
    .keyboard-shortcuts-content {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        z-index: 9999;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .keyboard-shortcuts-content .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        border-bottom: 1px solid #e0e0e0;
    }
    
    .keyboard-shortcuts-content .modal-header h2 {
        margin: 0;
        font-size: 24px;
        color: #333;
    }
    
    .keyboard-shortcuts-content .modal-body {
        padding: 24px;
    }
    
    .shortcuts-section {
        margin-bottom: 32px;
    }
    
    .shortcuts-section:last-of-type {
        margin-bottom: 0;
    }
    
    .shortcuts-section h3 {
        font-size: 18px;
        color: #555;
        margin: 0 0 16px 0;
        font-weight: 600;
    }
    
    .shortcuts-list {
        margin: 0;
        padding: 0;
    }
    
    .shortcut-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .shortcut-item:last-child {
        border-bottom: none;
    }
    
    .shortcut-item dt {
        flex: 0 0 200px;
        font-weight: normal;
    }
    
    .shortcut-item dd {
        margin: 0;
        color: #666;
        flex: 1;
    }
    
    kbd {
        display: inline-block;
        padding: 4px 8px;
        font-family: monospace;
        font-size: 12px;
        background: #f5f5f5;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        margin: 0 4px;
    }
    
    .shortcuts-tip {
        background: #e3f2fd;
        padding: 16px;
        border-radius: 8px;
        margin-top: 24px;
    }
    
    .shortcuts-tip p {
        margin: 0;
        color: #1976d2;
    }
    
    /* Dark theme */
    [data-theme="dark"] .keyboard-shortcuts-content {
        background: #1e1e1e;
    }
    
    [data-theme="dark"] .keyboard-shortcuts-content .modal-header {
        border-bottom-color: #333;
    }
    
    [data-theme="dark"] .keyboard-shortcuts-content .modal-header h2 {
        color: #e0e0e0;
    }
    
    [data-theme="dark"] .shortcuts-section h3 {
        color: #b0b0b0;
    }
    
    [data-theme="dark"] .shortcut-item {
        border-bottom-color: #2a2a2a;
    }
    
    [data-theme="dark"] .shortcut-item dd {
        color: #999;
    }
    
    [data-theme="dark"] kbd {
        background: #2a2a2a;
        border-color: #444;
        color: #e0e0e0;
    }
    
    [data-theme="dark"] .shortcuts-tip {
        background: #1a2332;
    }
    
    [data-theme="dark"] .shortcuts-tip p {
        color: #64b5f6;
    }
    
    /* Mobile responsive */
    @media (max-width: 768px) {
        .keyboard-shortcuts-content {
            max-width: 95%;
            max-height: 95vh;
        }
        
        .shortcut-item {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .shortcut-item dt {
            flex: none;
            margin-bottom: 4px;
        }
    }
`;
document.head.appendChild(styles);
