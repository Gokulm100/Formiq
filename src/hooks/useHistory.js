import { useState, useReducer, useCallback } from 'react'
import { formReducer } from '../reducer.js'

export function useHistory(initialState) {
  const [history, setHistory] = useState([initialState])
  const [cursor, setCursor] = useState(0)
  const [state, dispatch_] = useReducer(formReducer, initialState)

  const dispatch = useCallback((action) => {
    const next = formReducer(state, action)
    dispatch_(action)
    setHistory(h => {
      const trimmed = h.slice(0, cursor + 1)
      const limited = trimmed.length >= 20 ? trimmed.slice(1) : trimmed
      return [...limited, next]
    })
    setCursor(c => Math.min(c + 1, 19))
  }, [state, cursor])

  const undo = useCallback(() => {
    if (cursor > 0) {
      dispatch_({ type: 'LOAD_SCHEMA', schema: history[cursor - 1] })
      setCursor(c => c - 1)
    }
  }, [cursor, history])

  const redo = useCallback(() => {
    if (cursor < history.length - 1) {
      dispatch_({ type: 'LOAD_SCHEMA', schema: history[cursor + 1] })
      setCursor(c => c + 1)
    }
  }, [cursor, history])

  return {
    state, dispatch, undo, redo,
    canUndo: cursor > 0,
    canRedo: cursor < history.length - 1,
  }
}
