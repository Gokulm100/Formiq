import { defaultField, makeId } from './utils.js'

export const INITIAL_SCHEMA = {
  id: makeId(),
  name: 'Untitled Form',
  version: '1.0',
  createdAt: new Date().toISOString(),
  fields: [],
}

export function formReducer(state, action) {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload }

    case 'ADD_FIELD': {
      const field = { ...defaultField(action.fieldType), order: state.fields.length }
      return { ...state, fields: [...state.fields, field] }
    }

    case 'INSERT_FIELD_AT': {
      const field = { ...defaultField(action.fieldType), order: action.index }
      const newFields = [...state.fields]
      newFields.splice(action.index, 0, field)
      return { ...state, fields: newFields.map((f, i) => ({ ...f, order: i })) }
    }

    case 'REORDER_FIELD': {
      const { from, to } = action
      if (from === to) return state
      const fields = [...state.fields]
      const [moved] = fields.splice(from, 1)
      fields.splice(to, 0, moved)
      return { ...state, fields: fields.map((f, i) => ({ ...f, order: i })) }
    }

    case 'UPDATE_FIELD':
      return {
        ...state,
        fields: state.fields.map(f => f.id === action.id ? { ...f, ...action.updates } : f),
      }

    case 'DELETE_FIELD':
      return { ...state, fields: state.fields.filter(f => f.id !== action.id) }

    case 'DUPLICATE_FIELD': {
      const orig = state.fields.find(f => f.id === action.id)
      if (!orig) return state
      const idx = state.fields.indexOf(orig)
      const copy = { ...orig, id: makeId(), label: orig.label + ' (copy)' }
      const fields = [...state.fields]
      fields.splice(idx + 1, 0, copy)
      return { ...state, fields: fields.map((f, i) => ({ ...f, order: i })) }
    }

    case 'LOAD_SCHEMA':
      return action.schema

    default:
      return state
  }
}
