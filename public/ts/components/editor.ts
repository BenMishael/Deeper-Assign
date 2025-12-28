/**
 * DeeperDive Publisher Config Tool - Editor Component
 * 
 * Dynamic form generator that creates editable fields for publisher configs.
 * Handles all field types: primitives, arrays, nested objects.
 */

import type { PublisherConfig, PageConfig } from '../types.js';
import { h, clearChildren } from '../utils/dom.js';
import { store, updateWorkingConfig, hasUnsavedChanges } from '../state.js';
import { FIELD_DETECTION, UI_TIMING } from '../utils/constants.js';

// ============================================================================
// State Management
// ============================================================================

/**
 * Mark the form as being actively edited
 * Animations are disabled during editing and only re-enabled when switching publishers
 */
function setEditingState(isEditing: boolean): void {
  const form = document.getElementById('config-form');
  if (!form) return;
  
  if (isEditing) {
    form.classList.add('editing');
  }
  // Note: We don't remove the editing class here
  // It will be removed only when a new publisher is selected
}

/**
 * Clear editing state (called when switching publishers)
 */
export function clearEditingState(): void {
  const form = document.getElementById('config-form');
  if (form) {
    form.classList.remove('editing');
  }
}

// ============================================================================
// Field Metadata Configuration
// ============================================================================

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'url' | 'boolean' | 'textarea' | 'array-string' | 'array-object' | 'readonly';
  required?: boolean;
  placeholder?: string;
  hint?: string;
  section?: string;
}

const FIELD_CONFIGS: FieldConfig[] = [
  // Basic Info Section
  { key: 'publisherId', label: 'Publisher ID', type: 'readonly', section: 'Basic Information', hint: 'Unique identifier (read-only)' },
  { key: 'aliasName', label: 'Display Name', type: 'text', required: true, section: 'Basic Information', placeholder: 'e.g., Aurora Media' },
  { key: 'isActive', label: 'Active Status', type: 'boolean', section: 'Basic Information', hint: 'Enable or disable this publisher' },
  
  // Dashboards Section
  { key: 'publisherDashboard', label: 'Publisher Dashboard', type: 'url', section: 'Dashboards', placeholder: 'https://...' },
  { key: 'monitorDashboard', label: 'Monitor Dashboard', type: 'url', section: 'Dashboards', placeholder: 'https://...' },
  { key: 'qaStatusDashboard', label: 'QA Status Dashboard', type: 'url', section: 'Dashboards', placeholder: 'https://...' },
  
  // Configuration Section
  { key: 'pages', label: 'Page Configurations', type: 'array-object', section: 'Configuration' },
  { key: 'customCss', label: 'Custom CSS', type: 'textarea', section: 'Configuration', placeholder: '/* Add custom styles here */', hint: 'Optional CSS overrides' },
  
  // Optional Fields Section (known fields)
  { key: 'tags', label: 'Tags', type: 'array-string', section: 'Optional Settings', hint: 'e.g., tech, finance' },
  { key: 'allowedDomains', label: 'Allowed Domains', type: 'array-string', section: 'Optional Settings', hint: 'Whitelist domains' },
  { key: 'contactEmail', label: 'Contact Email', type: 'text', section: 'Optional Settings', placeholder: 'support@example.com' },
  { key: 'defaultLanguage', label: 'Default Language', type: 'text', section: 'Optional Settings', placeholder: 'en' },
  { key: 'notes', label: 'Notes', type: 'textarea', section: 'Optional Settings', placeholder: 'Additional information...' },
  { key: 'lastUpdated', label: 'Last Updated', type: 'readonly', section: 'Optional Settings' },
];

/**
 * Infer field type from value
 */
function inferFieldType(key: string, value: any): FieldConfig['type'] {
  if (value === null || value === undefined) {
    return 'text'; // Default to text for unknown types
  }
  
  if (typeof value === 'boolean') {
    return 'boolean';
  }
  
  if (typeof value === 'number') {
    return 'text'; // Numbers as text inputs
  }
  
  if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      return 'array-object';
    }
    return 'array-string';
  }
  
  if (typeof value === 'string') {
    // Check if it looks like a URL
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return 'url';
    }
    // Check if it's a long string (likely textarea)
    if (value.length > FIELD_DETECTION.TEXTAREA_THRESHOLD_CHARS || value.includes('\n')) {
      return 'textarea';
    }
    return 'text';
  }
  
  if (typeof value === 'object') {
    return 'array-object'; // Nested objects treated as object arrays
  }
  
  return 'text';
}

/**
 * Generate a human-readable label from a key
 */
function generateLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Detect dynamic fields from config that aren't in FIELD_CONFIGS
 */
function detectDynamicFields(config: PublisherConfig): FieldConfig[] {
  const knownKeys = new Set(FIELD_CONFIGS.map(f => f.key));
  const dynamicFields: FieldConfig[] = [];
  
  for (const [key, value] of Object.entries(config)) {
    // Skip known fields and null/undefined values
    if (knownKeys.has(key) || value === null || value === undefined) {
      continue;
    }
    
    const type = inferFieldType(key, value);
    const label = generateLabel(key);
    
    dynamicFields.push({
      key,
      label,
      type,
      section: 'Optional Settings',
      required: false,
    });
  }
  
  return dynamicFields;
}

// ============================================================================
// Field Renderers
// ============================================================================

/**
 * Render a text input field
 */
function renderTextField(config: FieldConfig, value: string, onChange: (value: string) => void): HTMLElement {
  const input = h('input', {
    type: 'text',
    className: `form-input ${config.type === 'url' ? 'url' : ''} ${config.type === 'readonly' ? 'readonly' : ''}`,
    value: value || '',
    placeholder: config.placeholder || '',
    readonly: config.type === 'readonly',
  }) as HTMLInputElement;
  
  input.addEventListener('focus', () => setEditingState(true));
  input.addEventListener('input', () => {
    setEditingState(true);
    
    // Validate required fields (especially Display Name / aliasName)
    if (config.required && config.key === 'aliasName') {
      const trimmedValue = input.value.trim();
      if (trimmedValue === '') {
        input.classList.add('error');
        input.setCustomValidity('Display Name is required and cannot be empty');
      } else {
        input.classList.remove('error');
        input.setCustomValidity('');
      }
    }
    
    onChange(input.value);
  });
  input.addEventListener('blur', () => {
    setEditingState(false);
    
    // Final validation on blur
    if (config.required && config.key === 'aliasName') {
      const trimmedValue = input.value.trim();
      if (trimmedValue === '') {
        input.classList.add('error');
        // Restore original value if empty
        const state = store.getState();
        if (state.originalConfig && state.originalConfig.aliasName) {
          input.value = state.originalConfig.aliasName;
          onChange(state.originalConfig.aliasName);
          input.classList.remove('error');
        }
      }
    }
  });
  
  // Initial validation for required fields
  if (config.required && config.key === 'aliasName') {
    const trimmedValue = (value || '').trim();
    if (trimmedValue === '') {
      input.classList.add('error');
    }
  }
  
  return input;
}

/**
 * Render a URL input field with validation
 */
function renderUrlField(config: FieldConfig, value: string, onChange: (value: string) => void): HTMLElement {
  const input = h('input', {
    type: 'url',
    className: 'form-input url',
    value: value || '',
    placeholder: config.placeholder || 'https://',
  }) as HTMLInputElement;
  
  input.addEventListener('input', () => {
    setEditingState(true);
    onChange(input.value);
  });
  
  return input;
}

/**
 * Render a textarea field
 */
function renderTextareaField(config: FieldConfig, value: string, onChange: (value: string) => void): HTMLElement {
  const textarea = h('textarea', {
    className: 'form-textarea',
    placeholder: config.placeholder || '',
  }) as HTMLTextAreaElement;
  
  textarea.value = value || '';
  
  textarea.addEventListener('input', () => {
    setEditingState(true);
    onChange(textarea.value);
  });
  
  return textarea;
}

/**
 * Render a boolean toggle switch
 */
function renderBooleanField(config: FieldConfig, value: boolean, onChange: (value: boolean) => void): HTMLElement {
  const container = h('div', { className: 'form-toggle' });
  
  const toggle = h('div', { 
    className: `toggle ${value ? 'active' : ''}`,
    tabindex: 0,
    role: 'switch',
    'aria-checked': value.toString(),
  });
  
  const label = h('span', { className: 'toggle__label' }, value ? 'Enabled' : 'Disabled');
  
  const handleToggle = () => {
    // Read current state from DOM instead of closure value
    const currentValue = toggle.classList.contains('active');
    const newValue = !currentValue;
    toggle.classList.toggle('active', newValue);
    toggle.setAttribute('aria-checked', newValue.toString());
    label.textContent = newValue ? 'Enabled' : 'Disabled';
    setEditingState(true);
    onChange(newValue);
  };
  
  toggle.addEventListener('click', handleToggle);
  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  });
  
  container.appendChild(toggle);
  container.appendChild(label);
  
  return container;
}

/**
 * Render a string array field (tags, domains)
 */
function renderStringArrayField(config: FieldConfig, value: string[] | undefined, onChange: (value: string[]) => void): HTMLElement {
  const container = h('div', { className: 'array-field' });
  const items = value || [];
  
  const header = h('div', { className: 'array-field__header' },
    h('span', { className: 'array-field__title' }, `${items.length} item${items.length !== 1 ? 's' : ''}`),
    h('button', { 
      type: 'button',
      className: 'btn btn--small btn--primary',
    }, '+ Add')
  );
  
  const itemsContainer = h('div', { className: 'array-field__items' });
  
  const render = () => {
    clearChildren(itemsContainer);
    
    if (items.length === 0) {
      itemsContainer.appendChild(
        h('div', { className: 'array-field__empty' }, 'No items yet. Click "Add" to create one.')
      );
    } else {
      items.forEach((item, index) => {
        const itemEl = h('div', { className: 'array-field__item' },
          h('input', {
            type: 'text',
            className: 'form-input',
            value: item,
          }),
          h('button', {
            type: 'button',
            className: 'btn btn--icon',
            title: 'Remove',
          }, '✕')
        );
        
        const input = itemEl.querySelector('input') as HTMLInputElement;
        const removeBtn = itemEl.querySelector('button') as HTMLButtonElement;
        
        input.addEventListener('input', () => {
          setEditingState(true);
          // Immutable update: create new array with updated value
          const updated = [...items];
          updated[index] = input.value;
          onChange(updated);
        });
        
        removeBtn.addEventListener('click', () => {
          setEditingState(true);
          // Immutable update: create new array without removed item
          const updated = items.filter((_, i) => i !== index);
          onChange(updated);
          render();
        });
        
        itemsContainer.appendChild(itemEl);
      });
    }
    
    // Update header count
    const title = header.querySelector('.array-field__title') as HTMLElement;
    title.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;
  };
  
  const addBtn = header.querySelector('button') as HTMLButtonElement;
  addBtn.addEventListener('click', () => {
    setEditingState(true);
    // Immutable update: create new array with added item
    const updated = [...items, ''];
    onChange(updated);
    render();
    // Focus the new input
    setTimeout(() => {
      const inputs = itemsContainer.querySelectorAll('input');
      const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
      lastInput?.focus();
    }, UI_TIMING.INPUT_FOCUS_DELAY_MS);
  });
  
  render();
  
  container.appendChild(header);
  container.appendChild(itemsContainer);
  
  return container;
}

/**
 * Render a page configuration array field
 */
function renderPageArrayField(config: FieldConfig, value: PageConfig[] | undefined, onChange: (value: PageConfig[]) => void): HTMLElement {
  const container = h('div', { className: 'array-field' });
  const pages = value || [];
  
  const header = h('div', { className: 'array-field__header' },
    h('span', { className: 'array-field__title' }, `${pages.length} page${pages.length !== 1 ? 's' : ''}`),
    h('button', { 
      type: 'button',
      className: 'btn btn--small btn--primary',
    }, '+ Add Page')
  );
  
  const itemsContainer = h('div', { className: 'array-field__items' });
  
  const render = () => {
    clearChildren(itemsContainer);
    
    if (pages.length === 0) {
      itemsContainer.appendChild(
        h('div', { className: 'array-field__empty' }, 'No pages configured. Click "Add Page" to create one.')
      );
    } else {
      pages.forEach((page, index) => {
        const pageEl = h('div', { className: 'object-array__item' },
          h('div', { className: 'object-array__item-header' },
            h('span', { className: 'object-array__item-title' }, `Page ${index + 1}: ${page.pageType || 'Unnamed'}`),
            h('button', {
              type: 'button',
              className: 'btn btn--icon',
              title: 'Remove Page',
            }, '✕')
          ),
          h('div', { className: 'object-array__fields' })
        );
        
        const fieldsContainer = pageEl.querySelector('.object-array__fields') as HTMLElement;
        const removeBtn = pageEl.querySelector('button') as HTMLButtonElement;
        
        // Page Type field
        const typeGroup = h('div', { className: 'form-group' },
          h('label', { className: 'form-group__label' }, 'Page Type'),
          h('input', {
            type: 'text',
            className: 'form-input',
            value: page.pageType || '',
            placeholder: 'homepage, text, video...',
          })
        );
        
        // Selector field
        const selectorGroup = h('div', { className: 'form-group' },
          h('label', { className: 'form-group__label' }, 'CSS Selector'),
          h('input', {
            type: 'text',
            className: 'form-input',
            value: page.selector || '',
            placeholder: '#main, .article...',
          })
        );
        
        // Position field
        const positionGroup = h('div', { className: 'form-group' },
          h('label', { className: 'form-group__label' }, 'Position'),
          h('input', {
            type: 'text',
            className: 'form-input',
            value: page.position || '',
            placeholder: 'top, bottom, sidebar...',
          })
        );
        
        fieldsContainer.appendChild(typeGroup);
        fieldsContainer.appendChild(selectorGroup);
        fieldsContainer.appendChild(positionGroup);
        
        // Event handlers
        const typeInput = typeGroup.querySelector('input') as HTMLInputElement;
        const selectorInput = selectorGroup.querySelector('input') as HTMLInputElement;
        const positionInput = positionGroup.querySelector('input') as HTMLInputElement;
        
        const updatePage = () => {
          setEditingState(true);
          // Immutable update: create new array with updated page
          const updated = [...pages];
          updated[index] = {
            pageType: typeInput.value,
            selector: selectorInput.value,
            position: positionInput.value,
          };
          onChange(updated);
          
          // Update title
          const title = pageEl.querySelector('.object-array__item-title') as HTMLElement;
          title.textContent = `Page ${index + 1}: ${typeInput.value || 'Unnamed'}`;
        };
        
        typeInput.addEventListener('input', updatePage);
        selectorInput.addEventListener('input', updatePage);
        positionInput.addEventListener('input', updatePage);
        
        removeBtn.addEventListener('click', () => {
          setEditingState(true);
          // Immutable update: create new array without removed page
          const updated = pages.filter((_, i) => i !== index);
          onChange(updated);
          render();
        });
        
        itemsContainer.appendChild(pageEl);
      });
    }
    
    // Update header count
    const title = header.querySelector('.array-field__title') as HTMLElement;
    title.textContent = `${pages.length} page${pages.length !== 1 ? 's' : ''}`;
  };
  
  const addBtn = header.querySelector('button') as HTMLButtonElement;
  addBtn.addEventListener('click', () => {
    setEditingState(true);
    // Immutable update: create new array with added page
    const updated = [...pages, {
      pageType: '',
      selector: '',
      position: 'top',
    }];
    onChange(updated);
    render();
  });
  
  render();
  
  container.appendChild(header);
  container.appendChild(itemsContainer);
  
  return container;
}

/**
 * Render a generic object array field (for dynamic fields)
 */
function renderGenericObjectArrayField(config: FieldConfig, value: any[] | undefined, onChange: (value: any[]) => void): HTMLElement {
  const container = h('div', { className: 'array-field' });
  const items = value || [];
  
  const header = h('div', { className: 'array-field__header' },
    h('span', { className: 'array-field__title' }, `${items.length} item${items.length !== 1 ? 's' : ''}`),
    h('button', { 
      type: 'button',
      className: 'btn btn--small btn--primary',
    }, '+ Add')
  );
  
  const itemsContainer = h('div', { className: 'array-field__items' });
  
  const render = () => {
    clearChildren(itemsContainer);
    
    if (items.length === 0) {
      itemsContainer.appendChild(
        h('div', { className: 'array-field__empty' }, `No items yet. Click "Add" to create one.`)
      );
    } else {
      items.forEach((item, index) => {
        const itemEl = h('div', { className: 'object-array__item' },
          h('div', { className: 'object-array__item-header' },
            h('span', { className: 'object-array__item-title' }, `${config.label} ${index + 1}`),
            h('button', {
              type: 'button',
              className: 'btn btn--icon',
              title: 'Remove',
            }, '✕')
          ),
          h('div', { className: 'object-array__fields' })
        );
        
        const fieldsContainer = itemEl.querySelector('.object-array__fields') as HTMLElement;
        const removeBtn = itemEl.querySelector('button') as HTMLButtonElement;
        
        // Dynamically render fields for each property in the object
        const keys = Object.keys(item);
        keys.forEach(key => {
          const fieldValue = item[key];
          const fieldGroup = h('div', { className: 'form-group' },
            h('label', { className: 'form-group__label' }, generateLabel(key))
          );
          
          let input: HTMLInputElement | HTMLTextAreaElement;
          
          if (typeof fieldValue === 'boolean') {
            // Boolean toggle
            const toggleContainer = renderBooleanField(
              { key, label: '', type: 'boolean' },
              fieldValue,
              (newVal) => {
                items[index] = { ...items[index], [key]: newVal };
                onChange([...items]);
              }
            );
            fieldGroup.appendChild(toggleContainer);
          } else if (typeof fieldValue === 'string' && fieldValue.length > 100) {
            // Textarea for long strings
            input = h('textarea', {
              className: 'form-textarea',
              value: fieldValue || '',
            }) as HTMLTextAreaElement;
            input.addEventListener('input', () => {
              setEditingState(true);
              items[index] = { ...items[index], [key]: input.value };
              onChange([...items]);
            });
            fieldGroup.appendChild(input);
          } else {
            // Regular text input
            input = h('input', {
              type: 'text',
              className: 'form-input',
              value: String(fieldValue || ''),
            }) as HTMLInputElement;
            input.addEventListener('input', () => {
              setEditingState(true);
              items[index] = { ...items[index], [key]: input.value };
              onChange([...items]);
            });
            fieldGroup.appendChild(input);
          }
          
          fieldsContainer.appendChild(fieldGroup);
        });
        
        removeBtn.addEventListener('click', () => {
          setEditingState(true);
          items.splice(index, 1);
          onChange([...items]);
          render();
        });
        
        itemsContainer.appendChild(itemEl);
      });
    }
    
    // Update header count
    const title = header.querySelector('.array-field__title') as HTMLElement;
    title.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;
  };
  
  const addBtn = header.querySelector('button') as HTMLButtonElement;
  addBtn.addEventListener('click', () => {
    setEditingState(true);
    // Create a new item with default structure based on first item or empty object
    const newItem = items.length > 0 
      ? Object.keys(items[0]).reduce((acc, key) => ({ ...acc, [key]: '' }), {} as any)
      : {};
    items.push(newItem);
    onChange([...items]);
    render();
  });
  
  render();
  
  container.appendChild(header);
  container.appendChild(itemsContainer);
  
  return container;
}

// ============================================================================
// Main Editor Renderer
// ============================================================================

/**
 * Render the complete form for a config
 */
export function renderEditor(config: PublisherConfig): HTMLElement {
  const form = document.getElementById('config-form') as HTMLFormElement;
  clearChildren(form);
  
  // Detect dynamic fields from config
  const dynamicFields = detectDynamicFields(config);
  
  // Combine static and dynamic field configs
  const allFieldConfigs = [...FIELD_CONFIGS, ...dynamicFields];
  
  // Group fields by section
  const sections = new Map<string, FieldConfig[]>();
  
  allFieldConfigs.forEach(fieldConfig => {
    const section = fieldConfig.section || 'General';
    if (!sections.has(section)) {
      sections.set(section, []);
    }
    sections.get(section)!.push(fieldConfig);
  });
  
  // Render each section
  sections.forEach((fields, sectionName) => {
    const sectionEl = h('div', { className: 'form-section' },
      h('h3', { className: 'form-section__title' }, sectionName)
    );
    
    fields.forEach(fieldConfig => {
      const value = (config as any)[fieldConfig.key];
      
      // Skip required fields that don't exist (shouldn't happen, but safety check)
      if (value === undefined && fieldConfig.required) {
        return;
      }
      
      // For optional fields, render them if they exist or if they're in the known optional list
      // Dynamic fields are always rendered if they exist in config
      
      const formGroup = h('div', { className: 'form-group' },
        h('label', { 
          className: `form-group__label ${fieldConfig.required ? 'required' : ''}` 
        }, fieldConfig.label)
      );
      
      const onChange = (newValue: any) => {
        const workingConfig = store.getState().workingConfig;
        if (workingConfig) {
          (workingConfig as any)[fieldConfig.key] = newValue;
          updateWorkingConfig(workingConfig);
          updateUIState();
        }
      };
      
      let fieldEl: HTMLElement;
      
      switch (fieldConfig.type) {
        case 'boolean':
          fieldEl = renderBooleanField(fieldConfig, value as boolean, onChange);
          break;
        case 'url':
          fieldEl = renderUrlField(fieldConfig, value as string, onChange);
          break;
        case 'textarea':
          fieldEl = renderTextareaField(fieldConfig, value as string, onChange);
          break;
        case 'array-string':
          fieldEl = renderStringArrayField(fieldConfig, value as string[], onChange);
          break;
        case 'array-object':
          // Use page-specific renderer for 'pages' field, generic for others
          if (fieldConfig.key === 'pages') {
            fieldEl = renderPageArrayField(fieldConfig, value as PageConfig[], onChange);
          } else {
            fieldEl = renderGenericObjectArrayField(fieldConfig, value as any[], onChange);
          }
          break;
        case 'readonly':
        case 'text':
        default:
          fieldEl = renderTextField(fieldConfig, value as string, onChange);
      }
      
      formGroup.appendChild(fieldEl);
      
      if (fieldConfig.hint) {
        formGroup.appendChild(
          h('div', { className: 'form-group__hint' }, fieldConfig.hint)
        );
      }
      
      sectionEl.appendChild(formGroup);
    });
    
    form.appendChild(sectionEl);
  });
  
  return form;
}

/**
 * Update UI state (dirty indicator, button states)
 */
function updateUIState(): void {
  const dirtyIndicator = document.getElementById('dirty-indicator');
  const btnSave = document.getElementById('btn-save') as HTMLButtonElement;
  const btnReset = document.getElementById('btn-reset') as HTMLButtonElement;
  
  const isDirty = hasUnsavedChanges();
  
  if (dirtyIndicator) {
    dirtyIndicator.classList.toggle('hidden', !isDirty);
  }
  
  if (btnSave) {
    btnSave.disabled = !isDirty;
  }
  
  if (btnReset) {
    btnReset.disabled = !isDirty;
  }
  
  // Update preview
  const state = store.getState();
  if (state.workingConfig) {
    updatePreview(state.workingConfig);
  }
}

/**
 * Update JSON preview with syntax highlighting
 */
function updatePreview(config: PublisherConfig): void {
  const previewContent = document.getElementById('preview-content');
  if (!previewContent) return;
  
  const json = JSON.stringify(config, null, 2);
  
  // Simple syntax highlighting
  const highlighted = json
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
    .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
    .replace(/: (null)/g, ': <span class="json-null">$1</span>');
  
  previewContent.innerHTML = highlighted;
}

