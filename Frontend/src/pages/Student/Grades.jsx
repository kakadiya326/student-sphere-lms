import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Toast from '../../components/Toast'
import Loader from '../../components/Loader'
import '../../styles/Grades.css'

const StudentGrades = () => {
    const navigate = useNavigate()
    const [submissions, setSubmissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [type, setType] = useState("")
    const [filter, setFilter] = useState("all") // all, pending, graded
    const [selectedSubmission, setSelectedSubmission] = useState(null)

    const fetchSubmissions = async () => {
        try {
            setLoading(true)
            // This would need a new API endpoint to get student's all submissions
            // For now, we'll fetch from localStorage or use existing endpoint
            const response = await api.get('/student/submissions/all')
            setSubmissions(response.data.submissions || [])
        } catch (error) {

            if (error.response?.data?.error) {
                setMessage(error.response.data.error)
                setType("error")
            } else if (error.response?.data?.warning) {
                setMessage(error.response.data.warning)
                setType("warning")
            } else {
                setMessage("Failed to load submissions")
                setType("error")
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSubmissions()
    }, [])

    const getFilteredSubmissions = () => {
        return submissions.filter(submission => {
            if (filter === "pending") {
                return submission.status === "draft" || submission.status === "submitted"
            }
            if (filter === "graded") {
                return submission.status === "graded"
            }
            return true
        })
    }

    const calculateStats = () => {
        const graded = submissions.filter(s => s.status === "graded")
        const pending = submissions.filter(s => s.status === "submitted")
        const totalPoints = submissions.reduce((sum, s) => sum + (s.maxPoints || 0), 0)
        const earnedPoints = graded.reduce((sum, s) => sum + (s.score || 0), 0)
        const percentage = totalPoints > 0 ? ((earnedPoints / totalPoints) * 100).toFixed(1) : 0

        return {
            total: submissions.length,
            graded: graded.length,
            pending: pending.length,
            totalPoints,
            earnedPoints,
            percentage
        }
    }

    const stats = calculateStats()
    const filteredSubmissions = getFilteredSubmissions()

    return (
        <div className="grades-container">
            <div className="grades-header">
                <h1 className="grades-title">📊 My Grades & Submissions</h1>
                <p className="grades-subtitle">Track your academic performance</p>
            </div>

            <Toast
                message={message}
                type={type}
                onClose={() => setMessage("")}
            />

            {loading ? (
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                    <Loader text="Loading grades..." />
                </div>
            ) : (
                <>
                        {/* Statistics Cards */}
                        <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number stat-total">{stats.total}</div>
                    <div className="stat-label">Total Submissions</div>
                </div>

                <div className="stat-card">
                    <div className="stat-number stat-graded">{stats.graded}</div>
                    <div className="stat-label">Graded</div>
                </div>

                <div className="stat-card">
                    <div className="stat-number stat-pending">{stats.pending}</div>
                    <div className="stat-label">Pending</div>
                </div>

                <div className="stat-card">
                    <div className="stat-number stat-percentage">{stats.percentage}%</div>
                    <div className="stat-label">Overall Score</div>
                </div>
            </div>

            {/* Points Summary */}
            {stats.earnedPoints > 0 && (
                <div className="points-summary">
                    <h3 className="points-title">
                        📈 Points: {stats.earnedPoints} / {stats.totalPoints}
                    </h3>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${stats.percentage}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="filter-tabs">
                {['all', 'pending', 'graded'].map(filterOption => (
                    <button
                        key={filterOption}
                        onClick={() => setFilter(filterOption)}
                        className={`filter-tab ${filter === filterOption ? 'active' : ''}`}
                    >
                        {filterOption === 'all' && `All (${submissions.length})`}
                        {filterOption === 'pending' && `Pending (${submissions.filter(s => s.status === 'submitted').length})`}
                        {filterOption === 'graded' && `Graded (${submissions.filter(s => s.status === 'graded').length})`}
                    </button>
                ))}
            </div>

            {/* Submissions List */}
            <div className="submissions-list">
                {filteredSubmissions.length === 0 ? (
                    <div className="empty-state">
                        <h3>No submissions found</h3>
                        <p>
                            {filter === 'all' && 'You haven\'t submitted anything yet.'}
                            {filter === 'pending' && 'No pending submissions.'}
                            {filter === 'graded' && 'No graded submissions.'}
                        </p>
                    </div>
                ) : (
                    <div className="submissions-grid">
                        {filteredSubmissions.map((submission) => (
                            <div
                                key={submission._id}
                                className="submission-card"
                                onClick={() => setSelectedSubmission(submission)}
                            >
                                <div className="submission-header">
                                    <div className="submission-info">
                                        <h4 className="submission-title">
                                            {submission.assignmentTitle || 'Assignment'}
                                        </h4>
                                        <p className="submission-meta">
                                            {submission.lessonTitle || 'Lesson'} • {submission.subjectTitle || 'Subject'}
                                        </p>
                                        <div className="submission-dates">
                                            <span>📅 Submitted: {new Date(submission.submittedAt || submission.createdAt).toLocaleDateString()}</span>
                                            {submission.dueDate && (
                                                <span>🎯 Due: {new Date(submission.dueDate).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="submission-score">
                                        <div className={`score-display ${submission.status === 'graded' ? 'graded' : 'pending'}`}>
                                            {submission.status === 'graded' ? `${submission.score || 0}/${submission.maxPoints || 0}` : '—'}
                                        </div>
                                        <div className={`status-badge status-${submission.status}`}>
                                            {submission.status === 'graded' ? '✓ Graded' :
                                                submission.status === 'submitted' ? '⏳ Pending' : 'Draft'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
                </>
            )}

            {/* Detail Modal */}
            {selectedSubmission && (
                <div className="modal-overlay" onClick={() => setSelectedSubmission(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Submission Details</h2>
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="modal-close"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-section">
                            <h3 className="section-title">{selectedSubmission.assignmentTitle || 'Assignment'}</h3>
                            <p className="section-meta">
                                {selectedSubmission.lessonTitle || 'Lesson'} • {selectedSubmission.subjectTitle || 'Subject'}
                            </p>
                            <p className="section-date">
                                Submitted: {new Date(selectedSubmission.submittedAt || selectedSubmission.createdAt).toLocaleString()}
                            </p>
                        </div>

                        <div className="modal-section">
                            <h4 className="section-title">Status & Score</h4>
                            <div className="status-score-container">
                                <div className="status-info">
                                    <div className="info-label">Status</div>
                                    <div className={`status-badge status-${selectedSubmission.status}`}>
                                        {selectedSubmission.status === 'graded' ? '✓ Graded' :
                                            selectedSubmission.status === 'submitted' ? '⏳ Pending' : 'Draft'}
                                    </div>
                                </div>
                                {selectedSubmission.status === 'graded' && (
                                    <div className="score-info">
                                        <div className="info-label">Score</div>
                                        <div className="score-value">
                                            {selectedSubmission.score || 0} / {selectedSubmission.maxPoints || 0}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedSubmission.feedback && (
                            <div className="modal-section">
                                <h4 className="section-title">Teacher Feedback</h4>
                                <div className="feedback-content">
                                    {selectedSubmission.feedback}
                                </div>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="btn-secondary"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    navigate(`/student/lessons/${selectedSubmission.lessonId}`)
                                    setSelectedSubmission(null)
                                }}
                                className="btn-primary"
                            >
                                View Lesson
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StudentGrades
