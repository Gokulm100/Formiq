import { useEffect } from 'react'
import styles from './Toast.module.css'

export default function Toast({ msg, type = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span className={styles.icon}>{type === 'success' ? '✓' : '⚠'}</span>
      {msg}
    </div>
  )
}
