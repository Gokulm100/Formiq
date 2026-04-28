import { useState } from 'react'
import FieldCard from './FieldCard.jsx'
import styles from './Canvas.module.css'

export default function Canvas({ fields, selectedId, onSelect, onDelete, onDuplicate, onDrop, onAddFromDrop }) {
  const [isDragOver, setIsDragOver] = useState(false)

  return (
    <div
      className={styles.wrap}
      onClick={e => { if (e.target === e.currentTarget) onSelect(null) }}
      onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={e => {
        e.preventDefault(); setIsDragOver(false)
        const fieldType = e.dataTransfer.getData('field-type')
        if (fieldType && fields.length === 0) onAddFromDrop(fieldType)
      }}
    >
      <div className={styles.inner}>
        {fields.length === 0 && (
          <div className={`${styles.empty} ${isDragOver ? styles.emptyDragOver : ''}`}>
            <div className={styles.emptyIcon}>⊕</div>
            <p>Drag fields here to start building</p>
            <small>Or click any field type in the palette on the left</small>
          </div>
        )}

        {fields.map((field, i) => (
          <FieldCard
            key={field.id}
            field={field}
            index={i}
            isSelected={field.id === selectedId}
            onSelect={onSelect}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onDrop={onDrop}
          />
        ))}

        {fields.length > 0 && (
          <div
            className={`${styles.dropZone} ${isDragOver ? styles.dropZoneActive : ''}`}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true) }}
            onDrop={e => {
              e.preventDefault(); e.stopPropagation(); setIsDragOver(false)
              const ft = e.dataTransfer.getData('field-type')
              if (ft) onAddFromDrop(ft)
            }}
          >
            Drop here to add at end
          </div>
        )}
      </div>
    </div>
  )
}
