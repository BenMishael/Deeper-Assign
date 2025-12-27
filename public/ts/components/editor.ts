/**
 * DeeperDive Publisher Config Tool - Editor Component
 * 
 * Dynamic form generator that creates editable fields for publisher configs.
 * Handles all field types: primitives, arrays, nested objects.
 */

import type { PublisherConfig, PageConfig } from '../types.js';
import { h, clearChildren } from '../utils/dom.js';
import { store, updateWorkingConfig, hasUnsavedChanges } from '../state.js';

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
  
  // Optional Fields Section
  { key: 'tags', label: 'Tags', type: 'array-string', section: 'Optional Settings', hint: 'e.g., tech, finance' },
  { key: 'allowedDomains', label: 'Allowed Domains', type: 'array-string', section: 'Optional Settings', hint: 'Whitelist domains' },
  { key: 'contactEmail', label: 'Contact Email', type: 'text', section: 'Optional Settings', placeholder: 'support@example.com' },
  { key: 'defaultLanguage', label: 'Default Language', type: 'text', section: 'Optional Settings', placeholder: 'en' },
  { key: 'notes', label: 'Notes', type: 'textarea', section: 'Optional Settings', placeholder: 'Additional information...' },
  { key: 'lastUpdated', label: 'Last Updated', type: 'readonly', section: 'Optional Settings' },
];

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
  
  input.addEventListener('input', () => onChange(input.value));
  
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
  
  input.addEventListener('input', () => onChange(input.value));
  
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
  textarea.addEventListener('input', () => onChange(textarea.value));
  
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
    const newValue = !value;
    toggle.classList.toggle('active', newValue);
    toggle.setAttribute('aria-checked', newValue.toString());
    label.textContent = newValue ? 'Enabled' : 'Disabled';
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
          items[index] = input.value;
          onChange([...items]);
        });
        
        removeBtn.addEventListener('click', () => {
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
    items.push('');
    onChange([...items]);
    render();
    // Focus the new input
    setTimeout(() => {
      const inputs = itemsContainer.querySelectorAll('input');
      const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
      lastInput?.focus();
    }, 50);
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
          pages[index] = {
            pageType: typeInput.value,
            selector: selectorInput.value,
            position: positionInput.value,
          };
          onChange([...pages]);
          
          // Update title
          const title = pageEl.querySelector('.object-array__item-title') as HTMLElement;
          title.textContent = `Page ${index + 1}: ${typeInput.value || 'Unnamed'}`;
        };
        
        typeInput.addEventListener('input', updatePage);
        selectorInput.addEventListener('input', updatePage);
        positionInput.addEventListener('input', updatePage);
        
        removeBtn.addEventListener('click', () => {
          pages.splice(index, 1);
          onChange([...pages]);
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
    pages.push({
      pageType: '',
      selector: '',
      position: 'top',
    });
    onChange([...pages]);
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
  
  // Group fields by section
  const sections = new Map<string, FieldConfig[]>();
  
  FIELD_CONFIGS.forEach(fieldConfig => {
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
      
      // Skip fields that don't exist in this config (optional fields)
      if (value === undefined && fieldConfig.key !== 'pages' && !fieldConfig.required) {
        // Only render if it's a known optional field that might be added
        if (!['tags', 'allowedDomains', 'contactEmail', 'defaultLanguage', 'notes', 'lastUpdated'].includes(fieldConfig.key)) {
          return;
        }
      }
      
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
          fieldEl = renderPageArrayField(fieldConfig, value as PageConfig[], onChange);
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

