import { useEffect } from 'react'
import './Toast.css'

function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle'
      case 'error':
        return 'fas fa-exclamation-circle'
      case 'warning':
        return 'fas fa-exclamation-triangle'
      case 'notification':
        return 'fas fa-bell'
      default:
        return 'fas fa-info-circle'
    }
  }

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">
        <i className={getIcon()}></i>
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>
        <i className="fas fa-times"></i>
      </button>
    </div>
  )
}

export default Toast
