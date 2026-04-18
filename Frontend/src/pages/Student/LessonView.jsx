import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLesson, submitAssignment, getStudentSubmissions, markLessonComplete } from '../../services/lessonService'
import Toast from '../../components/Toast'
import Loader from '../../components/Loader'
import '../../styles/LessonView.css'

const LessonView = () => {
    const { lessonId } = useParams()
    const navigate = useNavigate()
    const [lesson, setLesson] = useState(null)
    const [submissions, setSubmissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [type, setType] = useState("")
    const [currentAssignment, setCurrentAssignment] = useState(0)
    const [assignmentAnswers, setAssignmentAnswers] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [lessonStarted, setLessonStarted] = useState(false)

    const startLesson = () => {
        setLessonStarted(true)
        setShowContentOnly(false)
    }

    const fetchData = async () => {
        try {
            const [lessonRes, submissionsRes] = await Promise.all([
                getLesson(lessonId),
                getStudentSubmissions(lessonId)
            ])
            setLesson(lessonRes.data.lesson)
            setSubmissions(submissionsRes.data.submissions || [])

            // Initialize assignment answers
            const answers = {}
            lessonRes.data.lesson?.assignments?.forEach((assignment, index) => {
                const existingSubmission = submissionsRes.data.submissions?.find(s =>
                    s.answers && s.answers[index]
                )
                if (existingSubmission) {
                    answers[index] = existingSubmission.answers[index]
                }
            })
            setAssignmentAnswers(answers)
        } catch (error) {
            console.log(error)
            if (error.response?.data?.error) {
                setMessage(error.response.data.error)
                setType("error")
            } else if (error.response?.data?.warning) {
                setMessage(error.response.data.warning)
                setType("warning")
            } else {
                setMessage("Failed to load lesson")
                setType("error")
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData() // eslint-disable-line react-hooks/exhaustive-deps
    }, [lessonId])

    const handleAssignmentSubmit = async (assignmentIndex) => {
        const assignment = lesson.assignments[assignmentIndex]
        const answer = assignmentAnswers[assignmentIndex]

        // Validate submission
        if (assignment.type === 'text' || assignment.type === 'essay') {
            if (!answer?.content?.trim()) {
                setMessage("Please write your answer before submitting")
                setType("error")
                return
            }
        } else if (assignment.type === 'file_upload') {
            if (!answer?.files || answer.files.length === 0) {
                setMessage("Please select at least one file to upload")
                setType("error")
                return
            }
        } else if (assignment.type === 'quiz') {
            if (!answer?.answers || answer.answers.some(a => !a)) {
                setMessage("Please answer all quiz questions")
                setType("error")
                return
            }
        }

        setSubmitting(true)
        try {
            // Prepare form data for file upload
            const formData = new FormData()
            formData.append('lessonId', lessonId)
            formData.append('assignmentIndex', assignmentIndex)

            if (assignment.type === 'file_upload' && answer.files) {
                // Add files to form data
                answer.files.forEach((file) => {
                    formData.append('files', file)
                })
            } else {
                // For text and quiz, send answers as JSON
                formData.append('answers', JSON.stringify(answer.answers || []))
                if (answer.content) {
                    formData.append('textSubmission', answer.content)
                }
            }

            // Submit using the service
            const res = await submitAssignment({
                lessonId,
                assignmentIndex,
                answers: answer.answers || [],
                textSubmission: answer.content || '',
                files: answer.files || []
            })

            if (res.data.success) {
                setMessage(res.data.success)
                setType("success")
            }
            fetchData() // Refresh submissions

            // Move to next assignment or mark lesson complete
            if (assignmentIndex < lesson.assignments.length - 1) {
                setCurrentAssignment(assignmentIndex + 1)
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
                setMessage("Failed to submit assignment")
                setType("error")
            }
        } finally {
            setSubmitting(false)
        }
    }

    const updateAnswer = (assignmentIndex, field, value) => {
        setAssignmentAnswers(prev => ({
            ...prev,
            [assignmentIndex]: {
                ...prev[assignmentIndex],
                [field]: value
            }
        }))
    }

    const handleMarkComplete = async () => {
        try {
            const res = await markLessonComplete({ lessonId })
            if (res.data.success) {
                setMessage(res.data.success)
                setType("success")
            }
            fetchData()
        } catch (error) {
            console.log(error)
            if (error.response?.data?.error) {
                setMessage(error.response.data.error)
                setType("error")
            } else if (error.response?.data?.warning) {
                setMessage(error.response.data.warning)
                setType("warning")
            } else {
                setMessage("Failed to mark lesson complete")
                setType("error")
            }
        }
    }

    const allAssignmentsSubmitted = () => {
        if (!lesson?.assignments?.length) return true
        return lesson.assignments.every((_, index) => isAssignmentSubmitted(index))
    }

    const getSubmissionStatus = (assignmentIndex) => {
        const submission = submissions.find(s => s.assignmentIndex === assignmentIndex)
        if (!submission) return null
        return {
            status: submission.status,
            score: submission.grade,
            maxPoints: submission.maxPoints,
            feedback: submission.feedback,
            submittedAt: submission.submittedAt
        }
    }

    const isAssignmentOverdue = (dueDate) => {
        if (!dueDate) return false
        return new Date() > new Date(dueDate)
    }

    const getDaysUntilDue = (dueDate) => {
        if (!dueDate) return null
        const now = new Date()
        const due = new Date(dueDate)
        const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
        return days
    }

    if (loading) {
        return <Loader text="Loading lesson..." />
    }

    if (!lesson) {
        return <div style={{ padding: '20px' }}>Lesson not found</div>
    }

    const assignment = lesson.assignments?.[currentAssignment]
    const submissionStatus = getSubmissionStatus(currentAssignment)
    const isOverdue = assignment && isAssignmentOverdue(assignment.dueDate)
    const daysUntilDue = assignment && getDaysUntilDue(assignment.dueDate)

    return (
        <div className="lesson-view-container">
            <div className="lesson-view-header">
                <div>
                    <h1 className="lesson-view-title">📖 {lesson.title}</h1>
                    <p className="lesson-view-subtitle">
                        {lesson.description}
                    </p>
                    {lesson.duration > 0 && (
                        <p className="lesson-meta">
                            ⏱️ Estimated time: {lesson.duration} minutes
                        </p>
                    )}
                </div>
                <button
                    onClick={() => navigate(`/student/subjects/${lesson.subjectId._id}/lessons`)}
                    className="btn-lesson-view-secondary"
                >
                    ← Back
                </button>
            </div>

            {/* Lesson Start Screen */}
            {!lessonStarted ? (
                <div className="lesson-start-screen">
                    <div className="start-icon">🚀</div>
                    <h2 className="start-title">Ready to Start Your Lesson?</h2>
                    <p className="start-description">
                        This lesson contains {lesson.assignments?.length || 0} assignment{lesson.assignments?.length !== 1 ? 's' : ''}.
                        {lesson.duration > 0 && ` It should take about ${lesson.duration} minutes to complete.`}
                    </p>
                    <div className="start-details">
                        <div className="start-detail">
                            <div className="detail-label">Assignments</div>
                            <div className="detail-value">{lesson.assignments?.length || 0}</div>
                        </div>
                        <div className="start-detail">
                            <div className="detail-label">Duration</div>
                            <div className="detail-value">{lesson.duration || 0} mins</div>
                        </div>
                        <div className="start-detail">
                            <div className="detail-label">Subject</div>
                            <div className="detail-value">{lesson.subjectId?.name}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setLessonStarted(true)}
                        className="btn-start-lesson"
                    >
                        ▶️ Start Lesson
                    </button>
                </div>
            ) : (
                <>
                    {/* Lesson Content */}
                    {showContentOnly && (lesson.content || lesson.description) && (
                        <div className="lesson-content">
                            <div className="lesson-content-header">
                                <h3>📚 Lesson Content</h3>
                                <button
                                    onClick={() => setShowContentOnly(!showContentOnly)}
                                    className="btn-toggle-content"
                                >
                                    {showContentOnly ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <div className="lesson-content-body">
                                <div className="content-description">
                                    {lesson.content}
                                </div>
                            </div>
                        </div>
                    )}

                    <Toast
                            message={message}
                            type={type}
                            onClose={() => setMessage("")}
                    />
                </>
            )}

            {/* Assignment Navigation */}
            {lesson.assignments?.length > 0 && (
                <div className="assignment-navigation">
                    <h3>📝 Assignments ({currentAssignment + 1}/{lesson.assignments.length})</h3>
                    <div className="assignment-tabs">
                        {lesson.assignments.map((_, index) => {
                            const status = getSubmissionStatus(index)
                            return (
                                <button
                                    key={index}
                                    onClick={() => setCurrentAssignment(index)}
                                    className={`assignment-tab ${currentAssignment === index ? 'active' : ''}`}
                                    title={status?.status === 'graded' ? `Graded: ${status.score}/${status.maxPoints}` : status?.status === 'submitted' ? 'Pending grading' : 'Not submitted'}
                                >
                                    {index + 1}. {status?.status === 'graded' ? '✅' : status?.status === 'submitted' ? '⏳' : '⭕'}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Assignment Content */}
            {assignment && (
                <div className="assignment-section">
                    <div className="assignment-header">
                        <h3>📋 {assignment.title}</h3>
                        <p className="assignment-meta">
                            {assignment.description}
                        </p>
                    </div>

                    <div className="assignment-body">
                        <div className="assignment-details">
                            <div className="assignment-detail">
                                <span className="detail-label">Type</span>
                                <span className="detail-value">{assignment.type}</span>
                            </div>
                            {assignment.maxPoints > 0 && (
                                <div className="assignment-detail">
                                    <span className="detail-label">Points</span>
                                    <span className="detail-value">{assignment.maxPoints}</span>
                                </div>
                            )}
                            {assignment.dueDate && (
                                <div className="assignment-detail">
                                    <span className="detail-label">Due Date</span>
                                    <span className={`detail-value ${isOverdue ? 'overdue' : daysUntilDue <= 2 ? 'due-soon' : 'on-time'}`}>
                                        {new Date(assignment.dueDate).toLocaleDateString()}
                                        {daysUntilDue !== null && (
                                            <span> ({isOverdue ? `OVERDUE ${Math.abs(daysUntilDue)} days` : `${daysUntilDue} days left`})</span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Status Badge */}
                        {submissionStatus && (
                            <div className={`status-badge status-${submissionStatus.status}`}>
                                <div className="status-text">
                                    {submissionStatus.status === 'graded' ? '✅ GRADED' :
                                        submissionStatus.status === 'submitted' ? '⏳ SUBMITTED' : '❓ DRAFT'}
                                </div>
                                {submissionStatus.status === 'graded' && (
                                    <div className="status-score">
                                        {submissionStatus.score}/{submissionStatus.maxPoints} pts
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Assignment Form */}
                        {!submissionStatus || submissionStatus.status !== 'graded' ? (
                            <div className="submission-form">
                                {/* Form content will be added here */}
                                <p>Assignment form content...</p>
                            </div>
                        ) : (
                            <div className="feedback-section">
                                <div className="feedback-label">Teacher Feedback</div>
                                <div className="feedback-text">
                                    {submissionStatus.feedback || 'No feedback provided.'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Previous Submissions */}
            {submissions.length > 0 && (
                <div className="previous-submissions">
                    <div className="submissions-header">
                        <h3>📚 Previous Submissions</h3>
                        <p className="submissions-meta">Your submission history for this lesson</p>
                    </div>
                    <div className="submissions-body">
                        {submissions.map((submission, index) => (
                            <div key={index} className="submission-item">
                                <div className="submission-header">
                                    <span className="submission-date">
                                        {new Date(submission.submittedAt).toLocaleDateString()}
                                    </span>
                                    <span className={`submission-status status-${submission.status}`}>
                                        {submission.status}
                                    </span>
                                </div>
                                {submission.feedback && (
                                    <div className="submission-feedback">
                                        <div className="feedback-label">Feedback</div>
                                        <div className="feedback-text">{submission.feedback}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Toast message={message} type={type} onClose={() => setMessage("")} />
        </div>
    )
}

export default LessonView
