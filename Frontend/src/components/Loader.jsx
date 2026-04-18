import React from 'react'
import '../styles/global.css'

const Loader = ({ text = 'Loading...', overlay = false }) => {
    return (
        <div className={overlay ? 'loader-overlay' : 'loader-inline'}>
            <div className="myspin"></div>
            {text && <div className="loader-text">{text}</div>}
        </div>
    )
}

export default Loader
