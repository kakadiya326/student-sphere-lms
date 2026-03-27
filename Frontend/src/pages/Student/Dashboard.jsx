import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMySubjects } from '../../services/studentService'

const Dashboard = () => {
    const navigate = useNavigate()
    const [enrolledSubjects, setEnrolledSubjects] = useState([])
    const [progress, setProgress] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchEnrolledSubjects()
    }, [])

    const fetchEnrolledSubjects = async () => {
        try {
            const res = await getMySubjects()
            setEnrolledSubjects(res.data.subjects || [])
            setProgress(res.data.progress || [])
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const getProgressForSubject = (courseId) => {
        return progress.find(p => p.courseId === courseId)
    }

    const getProgressPercentage = (courseId) => {
        const prog = getProgressForSubject(courseId)
        return prog ? Math.min((prog.completedLessons / 10) * 100, 100) : 0
    }

    const getStatus = (courseId) => {
        const percentage = getProgressPercentage(courseId)
        if (percentage === 0) return 'Not Started'
        if (percentage === 100) return 'Completed'
        return 'In Progress'
    }

    const getStatusColor = (courseId) => {
        const status = getStatus(courseId)
        if (status === 'Completed') return '#28a745'
        if (status === 'In Progress') return '#ffc107'
        return '#dc3545'
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>🎓 Student Dashboard</h1>

            <div style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
                <button
                    onClick={() => navigate("/student/profile")}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    My Profile
                </button>
                <button
                    onClick={() => navigate("/student/subjects")}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Enroll New Subject
                </button>
            </div>

            <div style={{ marginTop: '30px' }}>
                <h2>📚 Enrolled Subjects</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : enrolledSubjects.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                        {enrolledSubjects.map(subject => {
                            const percentage = getProgressPercentage(subject._id)
                            const status = getStatus(subject._id)
                            const prog = getProgressForSubject(subject._id)

                            return (
                                <div
                                    key={subject._id}
                                    style={{
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        backgroundColor: '#fff',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)'
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)'
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 5px 0' }}>{subject.name}</h3>
                                            <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                                                <strong>Code:</strong> {subject.code}
                                            </p>
                                        </div>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            backgroundColor: getStatusColor(subject._id),
                                            color: 'white'
                                        }}>
                                            {status}
                                        </span>
                                    </div>

                                    <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                                        <strong>Teacher:</strong> {subject.teacherId?.userId?.name || 'N/A'}
                                    </p>
                                    <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                                        <strong>Email:</strong> {subject.teacherId?.userId?.email || 'N/A'}
                                    </p>

                                    <div style={{ marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Progress</span>
                                            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{percentage.toFixed(0)}%</span>
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: '8px',
                                            backgroundColor: '#e0e0e0',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${percentage}%`,
                                                height: '100%',
                                                backgroundColor: getStatusColor(subject._id),
                                                transition: 'width 0.3s ease'
                                            }}></div>
                                        </div>
                                    </div>

                                    <p style={{ margin: '8px 0', color: '#666', fontSize: '13px' }}>
                                        📝 Lessons Completed: <strong>{prog?.completedLessons || 0}/10</strong>
                                    </p>

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                        <button
                                            onClick={() => navigate("/student/mySubjects")}
                                            style={{
                                                flex: 1,
                                                padding: '8px 12px',
                                                backgroundColor: '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => navigate("/student/subjects")}
                                            style={{
                                                flex: 1,
                                                padding: '8px 12px',
                                                backgroundColor: '#6c757d',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            More Subjects
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                        </div>
                    ) : (
                        <div style={{ padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center', border: '2px dashed #dee2e6' }}>
                            <h3>No Subjects Enrolled Yet</h3>
                            <p style={{ color: '#666', marginBottom: '15px' }}>Start your learning journey by enrolling in subjects</p>
                            <button
                                onClick={() => navigate("/student/subjects")}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Browse Subjects
                            </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard