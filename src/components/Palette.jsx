import { FIELD_TYPES } from '../utils.js'
import styles from './Palette.module.css'

const categories = [...new Set(FIELD_TYPES.map(f => f.category))]

export default function Palette({ onAdd }) {
  return (
    <aside className={styles.palette}>
      <div className={styles.header}>Field Types</div>
      {categories.map(cat => (
        <div key={cat} className={styles.section}>
          <div className={styles.catLabel}>{cat}</div>
          {FIELD_TYPES.filter(f => f.category === cat).map(ft => (
            <div
              key={ft.type}
              className={styles.item}
              draggable
              onDragStart={e => e.dataTransfer.setData('field-type', ft.type)}
              onClick={() => onAdd(ft.type)}
              title={`Add ${ft.label}`}
            >
              <span className={styles.icon}>{ft.icon}</span>
              <span className={styles.label}>{ft.label}</span>
            </div>
          ))}
        </div>
      ))}
    </aside>
  )
}
