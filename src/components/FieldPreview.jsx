import styles from './FieldPreview.module.css'

export default function FieldPreview({ field }) {
  if (field.type === 'section') return (
    <div className={styles.sectionHeader}>
      <h3>{field.label || 'Section'}</h3>
      {field.description && <p>{field.description}</p>}
    </div>
  )

  return (
    <div className={styles.wrap}>
      <label className={styles.label}>
        {field.label || 'Untitled Field'}
        {field.required && <span className={styles.req}>*</span>}
      </label>

      {field.type === 'textarea' && (
        <textarea className={styles.input} rows={2} placeholder={field.placeholder || 'Enter text...'} readOnly />
      )}
      {['text', 'number', 'email', 'date'].includes(field.type) && (
        <input className={styles.input} type={field.type} placeholder={field.placeholder || ''} readOnly />
      )}
      {field.type === 'file' && (
        <input className={styles.input} type="file" style={{ padding: 4 }} readOnly />
      )}
      {field.type === 'dropdown' && (
        <select className={styles.input}>
          <option>Select an option...</option>
          {(field.options || []).map((o, i) => <option key={i}>{o}</option>)}
        </select>
      )}
      {field.type === 'radio' && (
        <div className={styles.choiceList}>
          {(field.options || []).map((o, i) => (
            <label key={i} className={styles.choice}>
              <input type="radio" readOnly style={{ accentColor: 'var(--accent)' }} /> {o}
            </label>
          ))}
        </div>
      )}
      {field.type === 'checkbox' && (
        <div className={styles.choiceList}>
          {(field.options || []).map((o, i) => (
            <label key={i} className={styles.choice}>
              <input type="checkbox" readOnly style={{ accentColor: 'var(--accent)' }} /> {o}
            </label>
          ))}
        </div>
      )}

      {field.helpText && <div className={styles.help}>{field.helpText}</div>}
    </div>
  )
}
