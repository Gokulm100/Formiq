import { useState } from 'react'
import { FIELD_TYPES } from '../utils.js'
import FieldPreview from './FieldPreview.jsx'
import styles from './FieldCard.module.css'

export default function FieldCard({ field, index, isSelected, onSelect, onDelete, onDuplicate, onDrop }) {
  const [dropPos, setDropPos] = useState(null)

  const ft = FIELD_TYPES.find(f => f.type === field.type)

  return (
    <div
      className={[
        styles.card,
        isSelected ? styles.selected : '',
        dropPos === 'above' ? styles.dropAbove : '',
        dropPos === 'below' ? styles.dropBelow : '',
      ].join(' ')}
      onClick={() => onSelect(field.id)}
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('reorder-idx', String(index))
        e.currentTarget.classList.add(styles.dragging)
      }}
      onDragEnd={e => {
        e.currentTarget.classList.remove(styles.dragging)
        setDropPos(null)
      }}
      onDragOver={e => {
        e.preventDefault()
        const rect = e.currentTarget.getBoundingClientRect()
        setDropPos(e.clientY < rect.top + rect.height / 2 ? 'above' : 'below')
      }}
      onDragLeave={() => setDropPos(null)}
      onDrop={e => {
        e.preventDefault()
        setDropPos(null)
        const reorderIdx = e.dataTransfer.getData('reorder-idx')
        const fieldType = e.dataTransfer.getData('field-type')
        const rect = e.currentTarget.getBoundingClientRect()
        const below = e.clientY >= rect.top + rect.height / 2
        if (reorderIdx !== '') onDrop({ type: 'reorder', from: parseInt(reorderIdx), to: below ? index + 1 : index })
        else if (fieldType) onDrop({ type: 'insert', fieldType, at: below ? index + 1 : index })
      }}
    >
      <div className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.typeIcon}>{ft?.icon}</span>
          <span className={styles.typeBadge}>{field.type}</span>
          {field.required && <span className={styles.reqBadge}>required</span>}
        </div>
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            title="Duplicate"
            onClick={e => { e.stopPropagation(); onDuplicate(field.id) }}
          >⧉</button>
          <button
            className={`${styles.actionBtn} ${styles.danger}`}
            title="Delete (Del)"
            onClick={e => { e.stopPropagation(); onDelete(field.id) }}
          >✕</button>
        </div>
      </div>
      <FieldPreview field={field} />
    </div>
  )
}
