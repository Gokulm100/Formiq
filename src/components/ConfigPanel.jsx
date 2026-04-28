import styles from './ConfigPanel.module.css'

export default function ConfigPanel({ field, allFields, onChange }) {
  if (!field) return (
    <aside className={styles.panel}>
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>👆</span>
        <p>Select a field to edit its properties</p>
      </div>
    </aside>
  )

  const upd = (k, v) => onChange({ [k]: v })

  return (
    <aside className={styles.panel}>
      <div className={styles.panelTitle}>
        Field Properties
        <span className={styles.typeTag}>{field.type}</span>
      </div>

      {/* Common properties */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>General</div>

        <div className={styles.group}>
          <label className={styles.label}>Label</label>
          <input className={styles.input} value={field.label || ''} onChange={e => upd('label', e.target.value)} />
        </div>

        {!['file', 'radio', 'checkbox', 'dropdown', 'section'].includes(field.type) && (
          <div className={styles.group}>
            <label className={styles.label}>Placeholder</label>
            <input className={styles.input} value={field.placeholder || ''} onChange={e => upd('placeholder', e.target.value)} />
          </div>
        )}

        {field.type === 'section' && (
          <div className={styles.group}>
            <label className={styles.label}>Description</label>
            <input className={styles.input} value={field.description || ''} onChange={e => upd('description', e.target.value)} />
          </div>
        )}

        {field.type !== 'section' && (
          <>
            <div className={styles.group}>
              <div className={styles.toggleRow}>
                <label className={styles.label} style={{ marginBottom: 0 }}>Required</label>
                <label className={styles.toggle}>
                  <input type="checkbox" checked={!!field.required} onChange={e => upd('required', e.target.checked)} />
                  <span className={styles.slider} />
                </label>
              </div>
            </div>

            <div className={styles.group}>
              <label className={styles.label}>Help Text</label>
              <input className={styles.input} value={field.helpText || ''} onChange={e => upd('helpText', e.target.value)} placeholder="Optional hint for the user" />
            </div>
          </>
        )}
      </section>

      {/* Text / Textarea constraints */}
      {(field.type === 'text' || field.type === 'textarea') && (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Length Constraints</div>
          <div className={styles.grid2}>
            <div className={styles.group}>
              <label className={styles.label}>Min Length</label>
              <input className={styles.input} type="number" min="0" value={field.minLength || ''} onChange={e => upd('minLength', e.target.value)} />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Max Length</label>
              <input className={styles.input} type="number" min="0" value={field.maxLength || ''} onChange={e => upd('maxLength', e.target.value)} />
            </div>
          </div>
        </section>
      )}

      {/* Number constraints */}
      {field.type === 'number' && (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Number Constraints</div>
          <div className={styles.grid2}>
            <div className={styles.group}>
              <label className={styles.label}>Min</label>
              <input className={styles.input} type="number" value={field.min || ''} onChange={e => upd('min', e.target.value)} />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Max</label>
              <input className={styles.input} type="number" value={field.max || ''} onChange={e => upd('max', e.target.value)} />
            </div>
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Step</label>
            <input className={styles.input} type="number" value={field.step || 1} onChange={e => upd('step', e.target.value)} />
          </div>
        </section>
      )}

      {/* File constraints */}
      {field.type === 'file' && (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>File Constraints</div>
          <div className={styles.group}>
            <label className={styles.label}>Accepted Types (e.g. .pdf,.png)</label>
            <input className={styles.input} value={field.acceptedTypes || ''} onChange={e => upd('acceptedTypes', e.target.value)} />
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Max Size (MB)</label>
            <input className={styles.input} type="number" value={field.maxSizeMB || 5} onChange={e => upd('maxSizeMB', e.target.value)} />
          </div>
        </section>
      )}

      {/* Options editor */}
      {['dropdown', 'radio', 'checkbox'].includes(field.type) && (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Options</div>
          <div className={styles.optionsList}>
            {(field.options || []).map((opt, i) => (
              <div key={i} className={styles.optionRow}>
                <input
                  className={styles.input}
                  value={opt}
                  onChange={e => {
                    const opts = [...(field.options || [])]; opts[i] = e.target.value; upd('options', opts)
                  }}
                />
                <button
                  className={styles.removeBtn}
                  onClick={() => upd('options', (field.options || []).filter((_, j) => j !== i))}
                >✕</button>
              </div>
            ))}
          </div>
          <button
            className={styles.addBtn}
            onClick={() => upd('options', [...(field.options || []), `Option ${((field.options || []).length + 1)}`])}
          >+ Add Option</button>
        </section>
      )}

      {/* Conditional visibility */}
      {field.type !== 'section' && allFields.filter(f => f.id !== field.id && f.type !== 'section').length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Conditional Visibility</div>
          <p className={styles.hint}>Show this field only when:</p>
          <div className={styles.condList}>
            {(field.conditions || []).map((cond, i) => (
              <div key={i} className={styles.condRow}>
                <div className={styles.condHeader}>
                  <span>Condition {i + 1}</span>
                  <button className={styles.removeBtn} onClick={() => {
                    const c = [...(field.conditions || [])]; c.splice(i, 1); upd('conditions', c)
                  }}>✕</button>
                </div>
                <select
                  className={styles.condSelect}
                  value={cond.fieldId || ''}
                  onChange={e => { const c = [...(field.conditions || [])]; c[i] = { ...c[i], fieldId: e.target.value }; upd('conditions', c) }}
                >
                  <option value="">Select field...</option>
                  {allFields.filter(f => f.id !== field.id && f.type !== 'section').map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
                <input
                  className={styles.condInput}
                  placeholder="equals value..."
                  value={cond.value || ''}
                  onChange={e => { const c = [...(field.conditions || [])]; c[i] = { ...c[i], value: e.target.value }; upd('conditions', c) }}
                />
              </div>
            ))}
          </div>
          <button
            className={styles.addBtn}
            onClick={() => upd('conditions', [...(field.conditions || []), { fieldId: '', value: '' }])}
          >+ Add Condition</button>
        </section>
      )}
    </aside>
  )
}
