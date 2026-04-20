import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMySubjects } from '../../services/studentService'
import { getAllStudentSubmissions } from '../../services/lessonService'
import Toast from '../../components/Toast'
import '../../styles/Dashboard.css'

const Dashboard = () => {
    const navigate = useNavigate()
    const [enrolledSubjects, setEnrolledSubjects] = useState([])
    const [progress, setProgress] = useState([])
    const [submissions, setSubmissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [type, setType] = useState("")

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const [subjectsRes, submissionsRes] = await Promise.all([
                getMySubjects(),
                getAllStudentSubmissions()
            ])
            setEnrolledSubjects(subjectsRes.data.subjects || [])
            setProgress(subjectsRes.data.progress || [])
            setSubmissions(submissionsRes.data.submissions || [])
        } catch (error) {

            if (error.response?.data?.error) {
                setMessage(error.response.data.error)
                setType("error")
            } else if (error.response?.data?.warning) {
                setMessage(error.response.data.warning)
                setType("warning")
            } else {
                setMessage("Failed to load dashboard data")
                setType("error")
            }
        } finally {
            setLoading(false)
        }
    }

    const getProgressForSubject = (courseId) => {
        return progress.find(p => p.courseId === courseId)
    }

    const getSubjectStats = (subjectId) => {
        const subjectSubmissions = submissions.filter(s => s.subjectTitle && s.subjectTitle === enrolledSubjects.find(sub => sub._id === subjectId)?.name)
        const gradedSubmissions = subjectSubmissions.filter(s => s.status === 'graded')
        const totalPoints = subjectSubmissions.reduce((sum, s) => sum + (s.maxPoints || 0), 0)
        const earnedPoints = gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0)
        const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0

        return {
            totalSubmissions: subjectSubmissions.length,
            gradedSubmissions: gradedSubmissions.length,
            totalPoints,
            earnedPoints,
            percentage,
            completedLessons: getProgressForSubject(subjectId)?.completedLessons || 0
        }
    }

    const getStatus = (subjectId) => {
        const stats = getSubjectStats(subjectId)
        if (stats.percentage === 0 && stats.totalSubmissions === 0) return 'Not Started'
        if (stats.percentage === 100) return 'Completed'
        return 'In Progress'
    }

    const getStatusColor = (subjectId) => {
        const status = getStatus(subjectId)
        if (status === 'Completed') return '#28a745'
        if (status === 'In Progress') return '#ffc107'
        return '#dc3545'
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">
                    📚 Student Dashboard
                </h1>
                <p className="dashboard-subtitle">
                    Welcome back! Here's an overview of your academic progress.
                </p>
            </div>

            <div className="dashboard-actions">
                <button
                    onClick={() => navigate("/student/profile")}
                    className="btn-dashboard"
                >
                    👤 My Profile
                </button>
                <button
                    onClick={() => navigate("/student/subjects")}
                    className="btn-dashboard-secondary"
                >
                    📖 Enroll New Subject
                </button>
            </div>

            {/* Quick Stats Section */}
            {!loading && enrolledSubjects.length > 0 && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-number">
                            {enrolledSubjects.length}
                        </div>
                        <div className="stat-label">Enrolled Subjects</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">
                            {submissions.filter(s => s.status === 'graded').length}
                        </div>
                        <div className="stat-label">Graded Assignments</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">
                            {Math.round(submissions.filter(s => s.status === 'graded').reduce((sum, s) => sum + (s.score || 0), 0) / Math.max(submissions.filter(s => s.status === 'graded').length, 1)) || 0}%
                        </div>
                        <div className="stat-label">Average Grade</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">
                            {enrolledSubjects.filter(sub => getStatus(sub._id) === 'Completed').length}
                        </div>
                        <div className="stat-label">Completed Subjects</div>
                    </div>
                </div>
            )}

            <div className="subjects-section">
                <h2 className="section-title">📖 My Subjects</h2>
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                    </div>
                ) : enrolledSubjects.length > 0 ? (
                    <div className="subjects-grid">
                        {enrolledSubjects.map(subject => {
                            const stats = getSubjectStats(subject._id)
                            const status = getStatus(subject._id)

                            return (
                                <div key={subject._id} className="subject-card">
                                    <div className="subject-header">
                                        <div>
                                            <h3 className="subject-title">{subject.name}</h3>
                                            <p className="subject-code">{subject.code}</p>
                                        </div>
                                        <span className={`subject-status status-enrolled`}>
                                            {status}
                                        </span>
                                    </div>

                                    <div className="subject-info">
                                        <div className="subject-detail">
                                            <span className="subject-label">Teacher:</span>
                                            <span className="subject-value">{subject.teacherId?.userId?.name || 'N/A'}</span>
                                        </div>
                                        <div className="subject-detail">
                                            <span className="subject-label">Email:</span>
                                            <span className="subject-value">{subject.teacherId?.userId?.email || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="subject-progress">
                                        <div className="progress-header">
                                            <span className="progress-label">Progress</span>
                                            <span className="progress-percentage">{stats.percentage}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${stats.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="subject-stats">
                                        <div className="stat-item">
                                            <strong>{stats.gradedSubmissions}/{stats.totalSubmissions}</strong> assignments graded
                                        </div>
                                        <div className="stat-item">
                                            <strong>{stats.earnedPoints}/{stats.totalPoints}</strong> points earned
                                        </div>
                                    </div>

                                    <div className="subject-actions">
                                        <button
                                            onClick={() => navigate(`/student/subjects/${subject._id}/lessons`)}
                                            className="btn-subject btn-subject-primary"
                                        >
                                            📚 View Lessons
                                        </button>
                                        <button
                                            onClick={() => navigate("/student/grades")}
                                            className="btn-subject btn-subject-success"
                                        >
                                            📊 View Grades
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <h3>No Subjects Enrolled Yet</h3>
                        <p>Start your learning journey by enrolling in subjects</p>
                        <button
                            onClick={() => navigate("/student/subjects")}
                            className="btn-empty"
                        >
                            Browse Subjects
                        </button>
                    </div>
                )}
            </div>

            <Toast message={message} type={type} onClose={() => setMessage("")} />
        </div>
    )
}

export default Dashboard