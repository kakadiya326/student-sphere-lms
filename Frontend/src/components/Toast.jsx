import React, { useEffect } from 'react'

const Toast = ({ msgText, msgType, clearMessage }) => {
    useEffect(() => {
        if (msgText) {
            const timer = setTimeout(() => clearMessage(), 3000)

            return () => clearTimeout(timer)
        }
    }, [msgText, clearMessage])

    if (!msgText) return null
    return (
        // <div className={type == "success" ? "success" : "error"}>
        <div style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "10px 20px",
            backgroundColor: msgType === "error" ? "#ff4d4f" : "#52c41a",
            color: "#fff",
            borderRadius: "5px"
        }}>
            {msgText}
        </div>
    )
}

export default Toast