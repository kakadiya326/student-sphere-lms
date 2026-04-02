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
    
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 20px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e0e0e0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
            <h3 style={{ margin: 0, cursor: 'pointer', color: '#007bff' }} onClick={() => navigate('/')}>
                📚 StudentSphere
            </h3>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {!user ? (
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#007bff',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            Sign Up
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Student Navigation */}
                        {user.role === 'student' && (
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button
                                    onClick={() => navigate('/student')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#007bff',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => navigate('/student/subjects')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#007bff',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Subjects
                                </button>
                                <button
                                    onClick={() => navigate('/student/grades')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#007bff',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    📊 Grades
                                </button>
                                <button
                                    onClick={() => navigate('/student/profile')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#007bff',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Profile
                                </button>
                            </div>
                        )}

                        {/* Teacher Navigation */}
                        {user.role === 'teacher' && (
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button
                                    onClick={() => navigate('/teacher')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#007bff',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => navigate('/teacher/subjects')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#007bff',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Subjects
                                </button>
                                <button
                                    onClick={() => navigate('/teacher/myprofile')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#007bff',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Profile
                                </button>
                            </div>
                        )}

                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center',
                            paddingLeft: '20px',
                            borderLeft: '1px solid #ddd'
                        }}>
                            <span style={{ fontSize: '14px', color: '#666' }}>
                                👤 {user.name || user.email} ({user.role})
                            </span>
                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Navbar