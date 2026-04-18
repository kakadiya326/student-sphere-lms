import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLessonsBySubject, getStudentSubmissions } from '../../services/lessonService'
import Toast from '../../components/Toast'
import Loader from '../../components/Loader'
import '../../styles/Lessons.css'

const StudentLessons = () => {
    const { subjectId } = useParams()
    const navigate = useNavigate()
    const [lessons, setLessons] = useState([])
    const [submissions, setSubmissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [type, setType] = useState("")
    const [subjectInfo, setSubjectInfo] = useState(null)

    const fetchData = async () => {
        try {
            const [lessonsRes, submissionsRes] = await Promise.all([
                getLessonsBySubject(subjectId),
                getStudentSubmissions(subjectId)
            ])
            setLessons(lessonsRes.data.lessons || [])
            setSubmissions(submissionsRes.data.submissions || [])
            // Get subject info from lesson if available
            if (lessonsRes.data.lessons?.length > 0) {
                setSubjectInfo(lessonsRes.data.lessons[0].subjectId)
            }
        } catch (error) {
            console.log(error)
            if (error.response?.data?.error) {
                setMessage(error.response.data.error)
                setType("error")
            } else if (error.response?.data?.warning) {
                setMessage(error.response.data.warning)
                setType("warning")
            } else {
                setMessage("Failed to load lessons")
                setType("error")
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [subjectId])

    const getSubmissionStatus = (lessonId) => {
        const lessonSubmissions = submissions.filter(s => s.lessonId === lessonId)
        if (lessonSubmissions.length === 0) return { status: 'not_started', completed: 0, total: 0, graded: 0 }

        const lesson = lessons.find(l => l._id === lessonId)
        const totalAssignments = lesson?.assignments?.length || 0
        const completedAssignments = lessonSubmissions.filter(s =>
            s.status === 'submitted' || s.status === 'graded'
        ).length
        const gradedAssignments = lessonSubmissions.filter(s =>
            s.status === 'graded'
        ).length

        return {
            status: completedAssignments === totalAssignments && totalAssignments > 0 ? 'completed' :
                completedAssignments > 0 ? 'in_progress' : 'not_started',
            completed: completedAssignments,
            total: totalAssignments,
            graded: gradedAssignments
        }
    }

    const calculateTotalProgress = () => {
        if (lessons.length === 0) return 0
        const totalSubmissions = lessons.reduce((sum, lesson) => {
            const status = getSubmissionStatus(lesson._id)
            return sum + status.completed
        }, 0)
        const totalAssignments = lessons.reduce((sum, lesson) => {
            return sum + (lesson.assignments?.length || 0)
        }, 0)
        return totalAssignments > 0 ? Math.round((totalSubmissions / totalAssignments) * 100) : 0
    }

    const totalProgress = calculateTotalProgress()

    return (
        <div className="lessons-container">
            <div className="lessons-header">
                <div>
                    <h1 className="lessons-title">📚 My Lessons</h1>
                    {subjectInfo && (
                        <p className="lessons-subtitle">
                            Subject: <strong>{subjectInfo?.name}</strong> {subjectInfo?.code && `(${subjectInfo.code})`}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => navigate('/student/subjects')}
                    className="btn-lessons-secondary"
                >
                    ← Back to Subjects
                </button>
            </div>

            <Toast
                message={message}
                type={type}
                onClose={() => setMessage("")}
            />

            {/* Overall Progress Summary */}
            {lessons.length > 0 && (
                <div className="progress-summary">
                    <div className="progress-header">
                        <h3>📊 Subject Progress</h3>
                        <div className="progress-percentage">{totalProgress}%</div>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${totalProgress}%` }}
                        ></div>
                    </div>
                    <p className="progress-details">
                        {lessons.reduce((sum, l) => sum + (l.assignments?.length || 0), 0)} total assignments •
                        {submissions.filter(s => s.status === 'graded').length} graded •
                        {submissions.filter(s => s.status === 'submitted').length} pending review
                    </p>
                </div>
            )}

            <div className="lessons-grid">
                {loading ? (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                        <Loader text="Loading lessons..." />
                    </div>
                ) : lessons.length === 0 ? (
                    <div className="empty-state">
                        <h3>📭 No lessons yet</h3>
                        <p>Your teacher hasn't created any lessons for this subject yet.</p>
                        <button
                            onClick={() => navigate('/student/subjects')}
                            className="btn-empty"
                        >
                            View Other Subjects
                        </button>
                    </div>
                ) : (
                    lessons.map((lesson, index) => {
                        const submissionStatus = getSubmissionStatus(lesson._id)
                        const statusClass = submissionStatus.status === 'completed' ? 'status-completed' :
                                          submissionStatus.status === 'in_progress' ? 'status-in-progress' : 'status-not-started'

                        return (
                            <div
                                key={lesson._id}
                                className="lesson-card"
                                onClick={() => navigate(`/student/lessons/${lesson._id}`)}
                            >
                                <div className="lesson-header">
                                    <div>
                                        <h3 className="lesson-title">
                                            {index + 1}. {lesson.title}
                                        </h3>
                                        <p className="lesson-meta">
                                            {lesson.duration > 0 && `⏱️ ${lesson.duration} mins`}
                                        </p>
                                    </div>
                                    <span className={`lesson-status ${statusClass}`}>
                                        {submissionStatus.status === 'completed' ? '✅ COMPLETED' :
                                            submissionStatus.status === 'in_progress' ? '🔄 IN PROGRESS' : '⏳ START'}
                                    </span>
                                </div>

                                <div className="lesson-content">
                                    {lesson.description && (
                                        <p className="lesson-description">
                                            {lesson.description}
                                        </p>
                                    )}
                                    <div className="lesson-details">
                                        <div className="lesson-detail">
                                            <span className="detail-label">Assignments</span>
                                            <span className="detail-value">{lesson.assignments?.length || 0}</span>
                                        </div>
                                        <div className="lesson-detail">
                                            <span className="detail-label">Completed</span>
                                            <span className="detail-value">{submissionStatus.completed}/{submissionStatus.total}</span>
                                        </div>
                                        <div className="lesson-detail">
                                            <span className="detail-label">Graded</span>
                                            <span className="detail-value">{submissionStatus.graded}</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {submissionStatus.total > 0 && (
                                        <div className="lesson-progress">
                                            <div className="progress-header">
                                                <span className="progress-label">Progress</span>
                                                <span className="progress-percentage">
                                                    {Math.round((submissionStatus.completed / submissionStatus.total) * 100) || 0}%
                                                </span>
                                            </div>
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${(submissionStatus.completed / submissionStatus.total) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="lesson-actions">
                                    <button
                                        onClick={() => navigate(`/student/lessons/${lesson._id}`)}
                                        className="btn-lesson btn-lesson-primary"
                                    >
                                        {submissionStatus.status === 'completed' ? '📖 Review Lesson' :
                                            submissionStatus.status === 'in_progress' ? '📝 Continue' : '🚀 Start Lesson'}
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default StudentLessons