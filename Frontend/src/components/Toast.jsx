import React, { useEffect } from 'react'
import '../styles/global.css'

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => onClose(), 3000)

            return () => clearTimeout(timer)
        }
    }, [message, onClose])

    if (!message) return null
    return (
        <div className={`toast ${type}`}>
            {message}
        </div>
    )
}

export default Toast