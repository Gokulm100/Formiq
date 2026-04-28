import { useState } from 'react'
import { validateField, isFieldVisible, makeId } from '../utils.js'
import styles from './PreviewMode.module.css'

export default function PreviewMode({ schema }) {
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    const errs = {}
    schema.fields.forEach(f => {
      if (f.type === 'section') return
      if (!isFieldVisible(f, values)) return
      const err = validateField(f, values[f.id])
      if (err) errs[f.id] = err
    })
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const subs = JSON.parse(localStorage.getItem('dfb_submissions_' + schema.id) || '[]')
    subs.push({ id: makeId(), formId: schema.id, formName: schema.name, submittedAt: new Date().toISOString(), data: values })
    localStorage.setItem('dfb_submissions_' + schema.id, JSON.stringify(subs))
    setSubmitted(true)
  }

  const setVal = (id, v) => {
    setValues(prev => ({ ...prev, [id]: v }))
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: null }))
  }

  if (submitted) return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <div className={styles.success}>
          <div className={styles.checkCircle}>✓</div>
          <h3>Submitted!</h3>
          <p>Your response has been recorded.</p>
          <button className={styles.btn} onClick={() => { setSubmitted(false); setValues({}); setErrors({}) }}>
            Submit Another Response
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <div className={styles.formHeader}>
          <h2>{schema.name || 'Untitled Form'}</h2>
          <p>{schema.fields.filter(f => f.type !== 'section').length} fields</p>
        </div>

        {schema.fields.map(field => {
          if (!isFieldVisible(field, values)) return null
          if (field.type === 'section') return (
            <div key={field.id} className={styles.sectionDivider}>
              <h3>{field.label}</h3>
              {field.description && <p>{field.description}</p>}
            </div>
          )
          const val = values[field.id] || ''
          const err = errors[field.id]
          return (
            <div key={field.id} className={styles.field}>
              <label className={styles.fieldLabel}>
                {field.label}
                {field.required && <span className={styles.req}>*</span>}
              </label>

              {field.type === 'textarea' && (
                <textarea className={`${styles.input} ${err ? styles.hasError : ''}`}
                  rows={4} placeholder={field.placeholder} value={val}
                  onChange={e => setVal(field.id, e.target.value)} />
              )}
              {['text', 'number', 'email', 'date'].includes(field.type) && (
                <input className={`${styles.input} ${err ? styles.hasError : ''}`}
                  type={field.type} placeholder={field.placeholder} value={val}
                  min={field.min} max={field.max} step={field.step}
                  onChange={e => setVal(field.id, e.target.value)} />
              )}
              {field.type === 'file' && (
                <input type="file" className={styles.fileInput}
                  accept={field.acceptedTypes || undefined}
                  onChange={e => setVal(field.id, e.target.files[0]?.name || '')} />
              )}
              {field.type === 'dropdown' && (
                <select className={`${styles.input} ${err ? styles.hasError : ''}`}
                  value={val} onChange={e => setVal(field.id, e.target.value)}>
                  <option value="">Select an option...</option>
                  {(field.options || []).map((o, i) => <option key={i} value={o}>{o}</option>)}
                </select>
              )}
              {field.type === 'radio' && (
                <div className={styles.choiceGroup}>
                  {(field.options || []).map((o, i) => (
                    <label key={i} className={styles.choiceOpt}>
                      <input type="radio" name={field.id} value={o} checked={val === o} onChange={() => setVal(field.id, o)} />
                      {o}
                    </label>
                  ))}
                </div>
              )}
              {field.type === 'checkbox' && (
                <div className={styles.choiceGroup}>
                  {(field.options || []).map((o, i) => {
                    const arr = Array.isArray(val) ? val : []
                    return (
                      <label key={i} className={styles.choiceOpt}>
                        <input type="checkbox" checked={arr.includes(o)}
                          onChange={e => setVal(field.id, e.target.checked ? [...arr, o] : arr.filter(v => v !== o))} />
                        {o}
                      </label>
                    )
                  })}
                </div>
              )}

              {field.helpText && <div className={styles.help}>{field.helpText}</div>}
              {err && <div className={styles.error}>⚠ {err}</div>}
            </div>
          )
        })}

        {schema.fields.length === 0 && (
          <div className={styles.emptyState}>
            <p>No fields yet</p>
            <small>Go back to the Builder tab to add fields</small>
          </div>
        )}

        {schema.fields.length > 0 && (
          <button className={styles.submitBtn} onClick={handleSubmit}>Submit Form</button>
        )}
      </div>
    </div>
  )
}
