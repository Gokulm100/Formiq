import { useState, useRef, useEffect, useCallback } from 'react'
import { useHistory } from './hooks/useHistory.js'
import { INITIAL_SCHEMA } from './reducer.js'
import { makeId } from './utils.js'
import Palette from './components/Palette.jsx'
import Canvas from './components/Canvas.jsx'
import ConfigPanel from './components/ConfigPanel.jsx'
import PreviewMode from './components/PreviewMode.jsx'
import SubmissionsView from './components/SubmissionsView.jsx'
import Toast from './components/Toast.jsx'
import styles from './App.module.css'

export default function App() {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useHistory(INITIAL_SCHEMA)
  const [selectedId, setSelectedId] = useState(null)
  const [activeTab, setActiveTab] = useState('builder')
  const [toast, setToast] = useState(null)
  const fileInputRef = useRef()

  const showToast = (msg, type = 'success') => setToast({ msg, type, id: makeId() })

  // Auto-load saved schema
  useEffect(() => {
    const saved = localStorage.getItem('dfb_autosave')
    if (saved) {
      try {
        const schema = JSON.parse(saved)
        dispatch({ type: 'LOAD_SCHEMA', schema })
      } catch (e) {}
    }
  }, [])

  // Auto-save every 30s
  useEffect(() => {
    const t = setInterval(() => {
      localStorage.setItem('dfb_autosave', JSON.stringify(state))
    }, 30000)
    return () => clearInterval(t)
  }, [state])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
      if (e.key === 'Delete' && selectedId && activeTab === 'builder') {
        dispatch({ type: 'DELETE_FIELD', id: selectedId })
        setSelectedId(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, selectedId, activeTab, dispatch])

  const selectedField = state.fields.find(f => f.id === selectedId) || null

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${state.name.replace(/\s+/g, '-').toLowerCase()}_schema.json`
    a.click()
    showToast('Schema exported successfully')
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleImport = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const schema = JSON.parse(ev.target.result)
        if (!schema.fields || !Array.isArray(schema.fields)) throw new Error('Invalid schema')
        dispatch({ type: 'LOAD_SCHEMA', schema: { ...schema, id: schema.id || makeId() } })
        showToast('Schema imported successfully')
      } catch {
        showToast('Invalid schema file', 'error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleFieldDrop = action => {
    if (action.type === 'reorder') {
      const { from, to } = action
      dispatch({ type: 'REORDER_FIELD', from, to: to < from ? to : to - 1 })
    } else if (action.type === 'insert') {
      dispatch({ type: 'INSERT_FIELD_AT', fieldType: action.fieldType, index: action.at })
    }
  }

  return (
    <div className={styles.app}>
      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.topLeft}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⬡</span>
            FormBuilder
          </div>
          <input
            className={styles.nameInput}
            value={state.name}
            onChange={e => dispatch({ type: 'SET_NAME', payload: e.target.value })}
            placeholder="Form name..."
          />
          <div className={styles.historyBtns}>
            <button className={styles.iconBtn} onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">↩</button>
            <button className={styles.iconBtn} onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">↪</button>
          </div>
        </div>
        <div className={styles.topRight}>
          <span className={styles.fieldCount}>{state.fields.length} field{state.fields.length !== 1 ? 's' : ''}</span>
          <button className={styles.btn} onClick={handleImportClick}>Import JSON</button>
          <button className={styles.btn} onClick={handleExport}>Export JSON</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setActiveTab('preview')}>
            Preview →
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <nav className={styles.tabs}>
        {[
          { id: 'builder', label: 'Builder' },
          { id: 'preview', label: 'Preview' },
          { id: 'submissions', label: 'Submissions' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main className={styles.main}>
        {activeTab === 'builder' && (
          <>
            <Palette onAdd={type => dispatch({ type: 'ADD_FIELD', fieldType: type })} />
            <Canvas
              fields={state.fields}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={id => { dispatch({ type: 'DELETE_FIELD', id }); if (selectedId === id) setSelectedId(null) }}
              onDuplicate={id => dispatch({ type: 'DUPLICATE_FIELD', id })}
              onDrop={handleFieldDrop}
              onAddFromDrop={type => dispatch({ type: 'ADD_FIELD', fieldType: type })}
            />
            <ConfigPanel
              field={selectedField}
              allFields={state.fields}
              onChange={updates => { if (selectedId) dispatch({ type: 'UPDATE_FIELD', id: selectedId, updates }) }}
            />
          </>
        )}
        {activeTab === 'preview' && <PreviewMode schema={state} />}
        {activeTab === 'submissions' && <SubmissionsView schema={state} />}
      </main>

      <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
      {toast && <Toast key={toast.id} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  )
}
