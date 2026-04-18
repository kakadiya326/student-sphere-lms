import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTeacherProfile } from '../../services/teacherService'
import { getSubjects } from '../../services/subjectService'
import Loader from '../../components/Loader'

const Dashboard = () => {
    const navigate = useNavigate()
    const [subjects, setSubjects] = useState([])
    const [profileCompleted, setProfileCompleted] = useState(false)
    const [loadingProfile, setLoadingProfile] = useState(true)
    const [loadingSubjects, setLoadingSubjects] = useState(true)

    useEffect(() => {
        const loadDashboard = async () => {
            setLoadingProfile(true)
            setLoadingSubjects(true)

            try {
                const [profileRes, subjectsRes] = await Promise.all([
                    getTeacherProfile(),
                    getSubjects()
                ])
                setProfileCompleted(!!profileRes.data.teacher)
                setSubjects(subjectsRes.data.subjects || [])
            } catch (error) {
                setProfileCompleted(false)
                setSubjects([])
            } finally {
                setLoadingProfile(false)
                setLoadingSubjects(false)
            }
        }

        loadDashboard()
    }, [])

    return (
        <div style={{ padding: '20px' }}>
            <h1>👨‍🏫 Teacher Dashboard</h1>

            {!loadingProfile && !profileCompleted && (
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
                        cursor: profileCompleted && !loadingProfile ? 'pointer' : 'not-allowed'
                    }}
                    disabled={!profileCompleted || loadingProfile}
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

            <div style={{ marginTop: '30px' }}>
                <h2>📚 My Subjects</h2>

                {loadingSubjects ? (
                    <Loader text="Loading subjects..." />
                ) : subjects.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px'
                    }}>
                        {subjects.map((subject) => (
                            <div
                                key={subject._id}
                                style={{
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    backgroundColor: '#fff',
                                    transition: '0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-3px)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                }}
                            >
                                <h3 style={{ marginBottom: '10px' }}>{subject.name}</h3>

                                <p style={{ margin: '5px 0', color: '#555' }}>
                                    <strong>Code:</strong> {subject.code}
                                </p>

                                <p style={{ margin: '5px 0', color: '#555' }}>
                                    <strong>Department:</strong> {subject.teacherId?.department || 'N/A'}
                                </p>

                                <p style={{ margin: '5px 0', color: '#555' }}>
                                    <strong>Status:</strong> Active
                                </p>

                                <button
                                    onClick={() => navigate(`/teacher/subjects/${subject._id}/lessons`)}
                                    style={{
                                        marginTop: '10px',
                                        padding: '8px 12px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Manage Lessons
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No subjects found</p>
                )}
            </div>
        </div>
    )
}

export default Dashboard