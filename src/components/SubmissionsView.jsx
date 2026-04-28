import { useState, useEffect } from 'react'
import { makeId } from '../utils.js'
import styles from './SubmissionsView.module.css'

export default function SubmissionsView({ schema }) {
  const [subs, setSubs] = useState([])

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('dfb_submissions_' + schema.id) || '[]')
    setSubs(data)
  }, [schema.id])

  const fields = schema.fields.filter(f => f.type !== 'section')

  const exportCSV = () => {
    if (subs.length === 0) return
    const headers = ['Submission ID', 'Submitted At', ...fields.map(f => f.label)]
    const rows = subs.map(s => [
      s.id,
      s.submittedAt,
      ...fields.map(f => {
        const v = s.data[f.id]
        return Array.isArray(v) ? v.join('; ') : (v || '')
      })
    ])
    const csv = [headers, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = `${schema.name.replace(/\s+/g, '-').toLowerCase()}_submissions.csv`
    a.click()
  }

  const clearAll = () => {
    localStorage.removeItem('dfb_submissions_' + schema.id)
    setSubs([])
  }

  const visibleFields = fields.slice(0, 5)

  return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Submissions</h2>
            <p className={styles.subtitle}>{subs.length} response{subs.length !== 1 ? 's' : ''} · "{schema.name}"</p>
          </div>
          <div className={styles.actions}>
            {subs.length > 0 && <button className={styles.btnGhost} onClick={clearAll}>Clear All</button>}
            <button className={`${styles.btn} ${subs.length === 0 ? styles.disabled : ''}`} onClick={exportCSV} disabled={subs.length === 0}>
              Export CSV
            </button>
          </div>
        </div>

        {subs.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📋</span>
            <p>No submissions yet</p>
            <small>Submit the form in Preview mode to see responses here</small>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Submitted At</th>
                  {visibleFields.map(f => <th key={f.id}>{f.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {subs.map((s, i) => (
                  <tr key={s.id}>
                    <td className={styles.num}>{i + 1}</td>
                    <td>{new Date(s.submittedAt).toLocaleString()}</td>
                    {visibleFields.map(f => (
                      <td key={f.id}>
                        {Array.isArray(s.data[f.id])
                          ? s.data[f.id].join(', ')
                          : (s.data[f.id] || <span className={styles.empty2}>—</span>)
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
