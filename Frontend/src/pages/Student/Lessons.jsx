import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLessonsBySubject } from '../../services/lessonService'
import { getStudentSubmissions } from '../../services/lessonService'
import Toast from '../../components/Toast'

const StudentLessons = () => {
    const { subjectId } = useParams()
    const navigate = useNavigate()
    const [lessons, setLessons] = useState([])
    const [submissions, setSubmissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [type, setType] = useState("")

    const fetchData = async () => {
        try {
            const [lessonsRes, submissionsRes] = await Promise.all([
                getLessonsBySubject(subjectId),
                getStudentSubmissions(subjectId) // This might need to be adjusted based on actual API
            ])
            setLessons(lessonsRes.data.lessons || [])
            setSubmissions(submissionsRes.data.submissions || [])
        } catch (error) {
            console.log(error)
            setMessage("Failed to load lessons")
            setType("error")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [subjectId])

    const getSubmissionStatus = (lessonId) => {
        const lessonSubmissions = submissions.filter(s => s.lessonId === lessonId)
        if (lessonSubmissions.length === 0) return { status: 'not_started', completed: 0, total: 0 }

        const totalAssignments = lessons.find(l => l._id === lessonId)?.assignments?.length || 0
        const completedAssignments = lessonSubmissions.filter(s =>
            s.answers && s.answers.length > 0
        ).length

        return {
            status: completedAssignments === totalAssignments ? 'completed' : 'in_progress',
            completed: completedAssignments,
            total: totalAssignments
        }
    }

    if (loading) {
        return <div style={{ padding: '20px' }}>Loading...</div>
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1>📚 My Lessons</h1>
                <p style={{ color: '#666', margin: '5px 0' }}>Subject ID: {subjectId}</p>
            </div>

            <Toast
                msgText={message}
                msgType={type}
                clearMessage={() => setMessage("")}
            />

            <div style={{ display: 'grid', gap: '20px' }}>
                {lessons.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        border: '2px dashed #ddd',
                        borderRadius: '8px',
                        color: '#666'
                    }}>
                        <h3>No lessons available</h3>
                        <p>Your teacher hasn't created any lessons yet</p>
                    </div>
                ) : (
                    lessons.map((lesson, index) => {
                        const submissionStatus = getSubmissionStatus(lesson._id)
                        return (
                            <div key={lesson._id} style={{
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                padding: '20px',
                                backgroundColor: 'white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                                onClick={() => navigate(`/student/lessons/${lesson._id}`)}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                                            {index + 1}. {lesson.title}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#666', flexWrap: 'wrap' }}>
                                            <span>📝 {lesson.assignments?.length || 0} assignments</span>
                                            <span>📊 Progress: {submissionStatus.completed}/{submissionStatus.total} completed</span>
                                            <span style={{
                                                color: submissionStatus.status === 'completed' ? '#28a745' :
                                                    submissionStatus.status === 'in_progress' ? '#ffc107' : '#6c757d'
                                            }}>
                                                {submissionStatus.status === 'completed' ? '✅ Completed' :
                                                    submissionStatus.status === 'in_progress' ? '🔄 In Progress' : '⏳ Not Started'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '24px' }}>
                                        {submissionStatus.status === 'completed' ? '🎉' :
                                            submissionStatus.status === 'in_progress' ? '📚' : '📖'}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                {submissionStatus.total > 0 && (
                                    <div style={{ marginTop: '15px' }}>
                                        <div style={{
                                            width: '100%',
                                            height: '8px',
                                            backgroundColor: '#e9ecef',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${(submissionStatus.completed / submissionStatus.total) * 100}%`,
                                                height: '100%',
                                                backgroundColor: submissionStatus.status === 'completed' ? '#28a745' : '#007bff',
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>
                                        <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0', textAlign: 'right' }}>
                                            {Math.round((submissionStatus.completed / submissionStatus.total) * 100)}% complete
                                        </p>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default StudentLessons