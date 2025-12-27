/**
 * DeeperDive Publisher Config Tool - DOM Utilities
 * 
 * Helper functions for DOM manipulation and element creation.
 * Provides a cleaner API for building UI components.
 */

// ============================================================================
// Element Creation
// ============================================================================

/**
 * Create an element with attributes and children
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string | boolean | number>,
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'className') {
        el.className = String(value);
      } else if (key.startsWith('data')) {
        // Convert dataSetName to data-set-name
        const dataKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        el.setAttribute(dataKey, String(value));
      } else if (typeof value === 'boolean') {
        if (value) el.setAttribute(key, '');
      } else {
        el.setAttribute(key, String(value));
      }
    }
  }
  
  for (const child of children) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(child);
    }
  }
  
  return el;
}

/**
 * Shorthand for createElement
 */
export const h = createElement;

// ============================================================================
// Query Helpers
// ============================================================================

/**
 * Query selector with type assertion
 */
export function $(selector: string, parent: ParentNode = document): HTMLElement | null {
  return parent.querySelector(selector);
}

/**
 * Query selector all with array return
 */
export function $$(selector: string, parent: ParentNode = document): HTMLElement[] {
  return Array.from(parent.querySelectorAll(selector));
}

/**
 * Get element by ID with type assertion
 */
export function $id<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

// ============================================================================
// DOM Manipulation
// ============================================================================

/**
 * Clear all children from an element
 */
export function clearChildren(el: HTMLElement): void {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

/**
 * Replace all children with new content
 */
export function replaceChildren(el: HTMLElement, ...children: (Node | string)[]): void {
  clearChildren(el);
  for (const child of children) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(child);
    }
  }
}

/**
 * Toggle class based on condition
 */
export function toggleClass(el: HTMLElement, className: string, force?: boolean): void {
  el.classList.toggle(className, force);
}

/**
 * Show element (remove hidden class)
 */
export function show(el: HTMLElement): void {
  el.classList.remove('hidden');
}

/**
 * Hide element (add hidden class)
 */
export function hide(el: HTMLElement): void {
  el.classList.add('hidden');
}

// ============================================================================
// Event Helpers
// ============================================================================

/**
 * Add event listener with automatic cleanup return
 */
export function on<K extends keyof HTMLElementEventMap>(
  el: HTMLElement,
  event: K,
  handler: (e: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions
): () => void {
  el.addEventListener(event, handler as EventListener, options);
  return () => el.removeEventListener(event, handler as EventListener, options);
}

/**
 * Delegate event to child elements matching selector
 */
export function delegate<K extends keyof HTMLElementEventMap>(
  parent: HTMLElement,
  event: K,
  selector: string,
  handler: (e: HTMLElementEventMap[K], target: HTMLElement) => void
): () => void {
  const delegatedHandler = (e: Event) => {
    const target = (e.target as HTMLElement).closest(selector) as HTMLElement | null;
    if (target && parent.contains(target)) {
      handler(e as HTMLElementEventMap[K], target);
    }
  };
  parent.addEventListener(event, delegatedHandler);
  return () => parent.removeEventListener(event, delegatedHandler);
}

// ============================================================================
// Form Helpers
// ============================================================================

/**
 * Get form field value
 */
export function getFieldValue(form: HTMLFormElement, name: string): string {
  const field = form.elements.namedItem(name);
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    return field.value;
  }
  return '';
}

/**
 * Set form field value
 */
export function setFieldValue(form: HTMLFormElement, name: string, value: string): void {
  const field = form.elements.namedItem(name);
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    field.value = value;
  }
}

