/**
 * DeeperDive Publisher Config Tool - State Management
 * 
 * Simple reactive state management for the application.
 * Provides centralized state with change notifications.
 */

import type { 
  AppState, 
  StateListener, 
  PublisherEntry, 
  PublisherConfig 
} from './types.js';

// ============================================================================
// Initial State
// ============================================================================

function createInitialState(): AppState {
  return {
    // Publisher list
    publishers: [],
    isLoadingPublishers: false,
    publishersError: null,

    // Selected publisher
    selectedPublisherId: null,

    // Config editing
    originalConfig: null,
    workingConfig: null,
    isLoadingConfig: false,
    configError: null,

    // Save state
    isSaving: false,
    saveError: null,
    lastSaveTime: null,
  };
}

// ============================================================================
// State Store Class
// ============================================================================

/**
 * Reactive state store with subscription support
 */
class StateStore {
  private state: AppState;
  private listeners: Set<StateListener>;

  constructor() {
    this.state = createInitialState();
    this.listeners = new Set();
  }

  /**
   * Get the current state (readonly snapshot)
   */
  getState(): Readonly<AppState> {
    return this.state;
  }

  /**
   * Update state with partial updates
   * Notifies all listeners of changes
   */
  setState(updates: Partial<AppState>): void {
    const changedKeys = Object.keys(updates) as (keyof AppState)[];
    
    this.state = {
      ...this.state,
      ...updates,
    };

    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(this.state, changedKeys);
      } catch (err) {
        console.error('State listener error:', err);
      }
    });
  }

  /**
   * Subscribe to state changes
   * @returns Unsubscribe function
   */
  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Reset state to initial values
   */
  reset(): void {
    this.setState(createInitialState());
  }
}

// ============================================================================
// Singleton Store Instance
// ============================================================================

export const store = new StateStore();

// ============================================================================
// Action Helpers (Convenience Methods)
// ============================================================================

/**
 * Set publishers list
 */
export function setPublishers(publishers: PublisherEntry[]): void {
  store.setState({
    publishers,
    isLoadingPublishers: false,
    publishersError: null,
  });
}

/**
 * Set publishers loading state
 */
export function setPublishersLoading(): void {
  store.setState({
    isLoadingPublishers: true,
    publishersError: null,
  });
}

/**
 * Set publishers error
 */
export function setPublishersError(error: string): void {
  store.setState({
    isLoadingPublishers: false,
    publishersError: error,
  });
}

/**
 * Select a publisher by ID
 */
export function selectPublisher(publisherId: string | null): void {
  store.setState({
    selectedPublisherId: publisherId,
    // Clear config when changing selection
    originalConfig: null,
    workingConfig: null,
    configError: null,
  });
}

/**
 * Set config loading state
 */
export function setConfigLoading(): void {
  store.setState({
    isLoadingConfig: true,
    configError: null,
  });
}

/**
 * Set loaded config (stores both original and working copy)
 */
export function setConfig(config: PublisherConfig): void {
  store.setState({
    originalConfig: structuredClone(config),
    workingConfig: structuredClone(config),
    isLoadingConfig: false,
    configError: null,
  });
}

/**
 * Set config error
 */
export function setConfigError(error: string): void {
  store.setState({
    isLoadingConfig: false,
    configError: error,
  });
}

/**
 * Update the working config (for edits)
 */
export function updateWorkingConfig(config: PublisherConfig): void {
  store.setState({
    workingConfig: config,
  });
}

/**
 * Reset working config to original
 */
export function resetWorkingConfig(): void {
  const { originalConfig } = store.getState();
  if (originalConfig) {
    store.setState({
      workingConfig: structuredClone(originalConfig),
    });
  }
}

/**
 * Set saving state
 */
export function setSaving(isSaving: boolean): void {
  store.setState({
    isSaving,
    saveError: null,
  });
}

/**
 * Set save success
 */
export function setSaveSuccess(): void {
  const { workingConfig } = store.getState();
  store.setState({
    isSaving: false,
    saveError: null,
    lastSaveTime: new Date(),
    // Update original to match working after successful save
    originalConfig: workingConfig ? structuredClone(workingConfig) : null,
  });
}

/**
 * Set save error
 */
export function setSaveError(error: string): void {
  store.setState({
    isSaving: false,
    saveError: error,
  });
}

// ============================================================================
// Computed State Helpers
// ============================================================================

/**
 * Check if there are unsaved changes
 */
export function hasUnsavedChanges(): boolean {
  const { originalConfig, workingConfig } = store.getState();
  if (!originalConfig || !workingConfig) return false;
  return JSON.stringify(originalConfig) !== JSON.stringify(workingConfig);
}

/**
 * Get the selected publisher entry
 */
export function getSelectedPublisher(): PublisherEntry | null {
  const { publishers, selectedPublisherId } = store.getState();
  if (!selectedPublisherId) return null;
  return publishers.find(p => p.id === selectedPublisherId) ?? null;
}

