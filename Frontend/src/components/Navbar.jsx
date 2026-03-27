import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserFromToken } from '../utils/auth'

const Navbar = () => {
    const navigate = useNavigate()
    const user = getUserFromToken()
    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/')
    }
    console.log('navbar');
    
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>LSM</h3>
            <div>
                {
                    user && (
                        <>
                            <span>{user.name}({user.role})</span>
                            <button onClick={handleLogout}>Logout</button>
                        </>
                    )
                }
            </div>

        </div>
    )
}

export default Navbar