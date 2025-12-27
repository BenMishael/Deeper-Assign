/**
 * DeeperDive Publisher Config Tool - Main Entry Point
 * 
 * Initializes the application and wires up all components.
 * This is the bootstrap file that sets up the app on page load.
 */

import { api } from './api.js';
import { 
  store, 
  setPublishers, 
  setPublishersLoading, 
  setPublishersError,
  selectPublisher,
  setConfigLoading,
  setConfig,
  setConfigError,
  getSelectedPublisher,
  setSaving,
  setSaveSuccess,
  setSaveError,
  resetWorkingConfig,
  hasUnsavedChanges,
} from './state.js';
import type { PublisherEntry, AppState } from './types.js';
import { $id, clearChildren, h, show, hide, on } from './utils/dom.js';
import { renderEditor, clearEditingState } from './components/editor.js';

// ============================================================================
// DOM References
// ============================================================================

const elements = {
  // Sidebar
  publisherList: $id('publisher-list')!,
  publisherLoading: $id('publisher-loading')!,
  publisherSearch: $id<HTMLInputElement>('publisher-search')!,
  
  // Content states
  emptyState: $id('empty-state')!,
  loadingState: $id('loading-state')!,
  errorState: $id('error-state')!,
  errorMessage: $id('error-message')!,
  errorRetry: $id('error-retry')!,
  
  // Editor
  editorPanel: $id('editor-panel')!,
  editorTitle: $id('editor-title')!,
  configForm: $id<HTMLFormElement>('config-form')!,
  dirtyIndicator: $id('dirty-indicator')!,
  
  // Preview
  previewPanel: $id('preview-panel')!,
  previewContent: $id('preview-content')!,
  copyJson: $id('copy-json')!,
  
  // Action bar
  actionBar: $id('action-bar')!,
  btnReset: $id<HTMLButtonElement>('btn-reset')!,
  btnExport: $id('btn-export')!,
  btnSave: $id<HTMLButtonElement>('btn-save')!,
  lastSaveTime: $id('last-save-time')!,
  
  // Toast
  toastContainer: $id('toast-container')!,
};

// ============================================================================
// Render Functions
// ============================================================================

/**
 * Render the publisher list in the sidebar
 */
function renderPublisherList(publishers: PublisherEntry[], selectedId: string | null, filter: string): void {
  const filtered = filter 
    ? publishers.filter(p => 
        p.alias.toLowerCase().includes(filter.toLowerCase()) ||
        p.id.toLowerCase().includes(filter.toLowerCase())
      )
    : publishers;

  clearChildren(elements.publisherList);
  
  if (filtered.length === 0) {
    elements.publisherList.appendChild(
      h('div', { className: 'sidebar__loading' }, 
        filter ? 'No publishers match your search' : 'No publishers found'
      )
    );
    return;
  }

  for (const publisher of filtered) {
    // We'll need the config to know active status - for now show as unknown
    const item = h('div', { 
      className: `publisher-item ${publisher.id === selectedId ? 'active' : ''}`,
      'data-id': publisher.id,
      'data-file': publisher.file,
      tabindex: 0,
      role: 'button',
    },
      h('div', { className: 'publisher-item__status' }), // Status will be updated when config loads
      h('div', { className: 'publisher-item__info' },
        h('div', { className: 'publisher-item__name' }, publisher.alias),
        h('div', { className: 'publisher-item__id' }, publisher.id)
      )
    );
    
    elements.publisherList.appendChild(item);
  }
}

/**
 * Show a content state (empty, loading, error, or editor)
 */
function showContentState(state: 'empty' | 'loading' | 'error' | 'editor'): void {
  hide(elements.emptyState);
  hide(elements.loadingState);
  hide(elements.errorState);
  hide(elements.editorPanel);
  hide(elements.previewPanel);
  hide(elements.actionBar);
  
  switch (state) {
    case 'empty':
      show(elements.emptyState);
      break;
    case 'loading':
      show(elements.loadingState);
      break;
    case 'error':
      show(elements.errorState);
      break;
    case 'editor':
      show(elements.editorPanel);
      show(elements.previewPanel);
      show(elements.actionBar);
      break;
  }
}

/**
 * Show a toast notification
 */
function showToast(type: 'success' | 'error' | 'warning' | 'info', message: string, duration = 4000): void {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };
  
  const toast = h('div', { className: `toast toast--${type}` },
    h('span', { className: 'toast__icon' }, icons[type]),
    h('span', { className: 'toast__message' }, message)
  );
  
  elements.toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================================================
// State Change Handlers
// ============================================================================

/**
 * Main state subscriber - updates UI when state changes
 */
function handleStateChange(state: AppState, changedKeys: (keyof AppState)[]): void {
  // Publishers list changed
  if (changedKeys.includes('publishers') || changedKeys.includes('selectedPublisherId')) {
    const filter = elements.publisherSearch.value;
    renderPublisherList(state.publishers, state.selectedPublisherId, filter);
    hide(elements.publisherLoading);
  }
  
  // Loading publishers
  if (changedKeys.includes('isLoadingPublishers')) {
    if (state.isLoadingPublishers) {
      show(elements.publisherLoading);
    } else {
      hide(elements.publisherLoading);
    }
  }
  
  // Config loading state
  if (changedKeys.includes('isLoadingConfig')) {
    if (state.isLoadingConfig) {
      showContentState('loading');
    }
  }
  
  // Config loaded or error
  if (changedKeys.includes('originalConfig') || changedKeys.includes('configError')) {
    if (state.configError) {
      elements.errorMessage.textContent = state.configError;
      showContentState('error');
    } else if (state.workingConfig) {
      showContentState('editor');
      updateEditorTitle(state.workingConfig.aliasName);
      // Only render editor when originalConfig changes (new publisher loaded)
      // Not when workingConfig changes (user editing)
      if (changedKeys.includes('originalConfig')) {
        renderEditor(state.workingConfig);
      }
      updatePreview(state.workingConfig);
      updateDirtyState();
    } else if (!state.selectedPublisherId) {
      showContentState('empty');
    }
  }
  
  // Update preview when workingConfig changes (but don't re-render form)
  if (changedKeys.includes('workingConfig') && !changedKeys.includes('originalConfig')) {
    if (state.workingConfig) {
      updatePreview(state.workingConfig);
    }
    updateDirtyState();
  }
  
  // Dirty state changed
  if (changedKeys.includes('workingConfig') || changedKeys.includes('originalConfig')) {
    updateDirtyState();
  }
  
  // Save state changed
  if (changedKeys.includes('lastSaveTime')) {
    if (state.lastSaveTime) {
      const timeStr = state.lastSaveTime.toLocaleTimeString();
      elements.lastSaveTime.textContent = `Last saved at ${timeStr}`;
    }
  }
}

/**
 * Update the editor title
 */
function updateEditorTitle(name: string): void {
  elements.editorTitle.textContent = `${name} Configuration`;
}

/**
 * Update the JSON preview
 */
function updatePreview(config: object): void {
  const json = JSON.stringify(config, null, 2);
  // Simple syntax highlighting
  const highlighted = json
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
    .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
    .replace(/: (null)/g, ': <span class="json-null">$1</span>');
  
  elements.previewContent.innerHTML = highlighted;
}

/**
 * Update dirty state indicators
 */
function updateDirtyState(): void {
  const isDirty = hasUnsavedChanges();
  
  elements.dirtyIndicator.classList.toggle('hidden', !isDirty);
  elements.btnSave.disabled = !isDirty;
  elements.btnReset.disabled = !isDirty;
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle publisher selection
 */
async function handlePublisherSelect(publisherId: string, filename: string): Promise<void> {
  // Clear editing state to re-enable animations for the new publisher
  clearEditingState();
  
  selectPublisher(publisherId);
  setConfigLoading();
  
  const response = await api.fetchPublisherConfig(filename);
  
  if (response.success && response.data) {
    setConfig(response.data);
  } else {
    setConfigError(response.error || 'Failed to load configuration');
  }
}

/**
 * Handle search input
 */
function handleSearch(): void {
  const state = store.getState();
  renderPublisherList(state.publishers, state.selectedPublisherId, elements.publisherSearch.value);
}

/**
 * Handle copy JSON button
 */
function handleCopyJson(): void {
  const state = store.getState();
  if (state.workingConfig) {
    const json = JSON.stringify(state.workingConfig, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      showToast('success', 'JSON copied to clipboard');
    }).catch(() => {
      showToast('error', 'Failed to copy JSON');
    });
  }
}

/**
 * Handle retry button click
 */
function handleRetry(): void {
  const publisher = getSelectedPublisher();
  if (publisher) {
    handlePublisherSelect(publisher.id, publisher.file);
  }
}

/**
 * Handle save configuration
 */
async function handleSave(): Promise<void> {
  const state = store.getState();
  const publisher = getSelectedPublisher();
  
  if (!state.workingConfig || !publisher) return;
  
  setSaving(true);
  
  const response = await api.savePublisherConfig(publisher.file, state.workingConfig);
  
  if (response.success) {
    setSaveSuccess();
    showToast('success', 'Configuration saved successfully');
  } else {
    setSaveError(response.error || 'Failed to save configuration');
    showToast('error', response.error || 'Failed to save configuration');
  }
}

/**
 * Handle reset changes
 */
function handleReset(): void {
  if (!hasUnsavedChanges()) return;
  
  if (confirm('Are you sure you want to discard all changes?')) {
    resetWorkingConfig();
    const state = store.getState();
    if (state.workingConfig) {
      renderEditor(state.workingConfig);
      updatePreview(state.workingConfig);
    }
    showToast('info', 'Changes discarded');
  }
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Load initial data
 */
async function loadPublishers(): Promise<void> {
  setPublishersLoading();
  
  const response = await api.fetchPublishers();
  
  if (response.success && response.data) {
    setPublishers(response.data.publishers);
  } else {
    setPublishersError(response.error || 'Failed to load publishers');
    showToast('error', 'Failed to load publishers list');
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners(): void {
  // Publisher list click delegation
  on(elements.publisherList, 'click', (e) => {
    const item = (e.target as HTMLElement).closest('.publisher-item') as HTMLElement;
    if (item) {
      const id = item.dataset.id;
      const file = item.dataset.file;
      if (id && file) {
        handlePublisherSelect(id, file);
      }
    }
  });
  
  // Search input
  on(elements.publisherSearch, 'input', handleSearch);
  
  // Copy JSON button
  on(elements.copyJson, 'click', handleCopyJson);
  
  // Retry button
  on(elements.errorRetry, 'click', handleRetry);
  
  // Export button
  on(elements.btnExport, 'click', () => {
    const state = store.getState();
    if (state.workingConfig) {
      const json = JSON.stringify(state.workingConfig, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${state.workingConfig.publisherId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('success', 'Configuration exported');
    }
  });
  
  // Save button
  on(elements.btnSave, 'click', handleSave);
  
  // Reset button
  on(elements.btnReset, 'click', handleReset);
}

/**
 * Initialize the application
 */
async function init(): Promise<void> {
  console.log('🚀 DeeperDive Config Tool initializing...');
  
  // Subscribe to state changes
  store.subscribe(handleStateChange);
  
  // Set up event listeners
  setupEventListeners();
  
  // Load initial data
  await loadPublishers();
  
  console.log('✅ DeeperDive Config Tool ready');
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

