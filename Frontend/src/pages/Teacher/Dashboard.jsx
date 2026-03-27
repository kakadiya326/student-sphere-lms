import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTeacherProfile } from '../../services/teacherService'

const Dashboard = () => {
    const navigate = useNavigate()
    const [profileCompleted, setProfileCompleted] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkProfile()
    }, [])

    const checkProfile = async () => {
        try {
            const res = await getTeacherProfile()
            setProfileCompleted(!!res.data.teacher)
        } catch {
            setProfileCompleted(false)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>👨‍🏫 Teacher Dashboard</h1>

            {!profileCompleted && (
                <div style={{
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: '4px',
                    padding: '15px',
                    marginBottom: '20px'
                }}>
                    <p style={{ margin: '0 0 10px 0', color: '#856404' }}>
                        ⚠️ Please complete your profile to access all features.
                    </p>
                    <button
                        onClick={() => navigate('/complete-teacher-profile')}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#ffc107',
                            color: '#212529',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Complete Profile
                    </button>
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                    onClick={() => navigate('/teacher/subjects')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: profileCompleted ? '#007bff' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: profileCompleted ? 'pointer' : 'not-allowed'
                    }}
                    disabled={!profileCompleted}
                >
                    Manage Subjects
                </button>
                <button
                    onClick={() => navigate('/teacher/myprofile')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    My Profile
                </button>
            </div>
        </div>
    )
}

export default Dashboard