export const FIELD_TYPES = [
  { type: 'text',     label: 'Text Input',      icon: '✏️',  category: 'Input' },
  { type: 'textarea', label: 'Textarea',         icon: '📄',  category: 'Input' },
  { type: 'number',   label: 'Number',           icon: '🔢',  category: 'Input' },
  { type: 'email',    label: 'Email',            icon: '✉️',  category: 'Input' },
  { type: 'date',     label: 'Date Picker',      icon: '📅',  category: 'Input' },
  { type: 'file',     label: 'File Upload',      icon: '📎',  category: 'Input' },
  { type: 'dropdown', label: 'Dropdown',         icon: '⬇️',  category: 'Choice' },
  { type: 'radio',    label: 'Radio Group',      icon: '⭕',  category: 'Choice' },
  { type: 'checkbox', label: 'Checkbox Group',   icon: '☑️',  category: 'Choice' },
  { type: 'section',  label: 'Section Header',   icon: '▬',   category: 'Layout' },
]

export const makeId = () => Math.random().toString(36).slice(2, 10)

export const defaultField = (type) => {
  const base = {
    id: makeId(), type,
    label: FIELD_TYPES.find(f => f.type === type)?.label || type,
    placeholder: '', required: false, helpText: '', order: 0, conditions: [],
  }
  if (['dropdown', 'radio', 'checkbox'].includes(type)) base.options = ['Option 1', 'Option 2', 'Option 3']
  if (type === 'text' || type === 'textarea') { base.minLength = ''; base.maxLength = '' }
  if (type === 'number') { base.min = ''; base.max = ''; base.step = 1 }
  if (type === 'file') { base.acceptedTypes = ''; base.maxSizeMB = 5 }
  if (type === 'section') { base.label = 'Section Title'; base.description = '' }
  return base
}

export const validateField = (field, value) => {
  if (field.required && (!value || value === '' || (Array.isArray(value) && value.length === 0)))
    return `${field.label} is required`
  if (value && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return 'Please enter a valid email address'
  if (value && (field.type === 'text' || field.type === 'textarea')) {
    if (field.minLength && value.length < parseInt(field.minLength))
      return `Minimum ${field.minLength} characters required`
    if (field.maxLength && value.length > parseInt(field.maxLength))
      return `Maximum ${field.maxLength} characters allowed`
  }
  if (value && field.type === 'number') {
    const n = parseFloat(value)
    if (field.min !== '' && field.min !== undefined && n < parseFloat(field.min))
      return `Minimum value is ${field.min}`
    if (field.max !== '' && field.max !== undefined && n > parseFloat(field.max))
      return `Maximum value is ${field.max}`
  }
  return null
}

export const isFieldVisible = (field, formValues) => {
  if (!field.conditions || field.conditions.length === 0) return true
  return field.conditions.every(c => {
    if (!c.fieldId) return true
    return String(formValues[c.fieldId] || '') === String(c.value || '')
  })
}
