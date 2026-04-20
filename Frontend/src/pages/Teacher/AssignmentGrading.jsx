import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSubmissionsForLesson, gradeSubmission } from '../../services/lessonService'
import { getLesson } from '../../services/lessonService'
import Toast from '../../components/Toast'
import Loader from '../../components/Loader'

const AssignmentGrading = () => {
    const { lessonId, assignmentIndex } = useParams()
    const navigate = useNavigate()
    const [lesson, setLesson] = useState(null)
    const [submissions, setSubmissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [type, setType] = useState("")
    const [gradingSubmission, setGradingSubmission] = useState(null)
    const [gradeForm, setGradeForm] = useState({
        score: '',
        feedback: ''
    })

    const fetchData = async () => {
        try {
            const [lessonRes, submissionsRes] = await Promise.all([
                getLesson(lessonId),
                getSubmissionsForLesson(lessonId)
            ])
            setLesson(lessonRes.data.lesson)
            setSubmissions(submissionsRes.data.submissions || [])
        } catch (error) {

            if (error.response?.data?.error) {
                setMessage(error.response.data.error)
                setType("error")
            } else if (error.response?.data?.warning) {
                setMessage(error.response.data.warning)
                setType("warning")
            } else {
                setMessage("Failed to load data")
                setType("error")
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [lessonId])

    const handleGradeSubmission = async (e) => {
        e.preventDefault()

        try {
            const res = await gradeSubmission(gradingSubmission._id, {
                score: parseInt(gradeForm.score),
                feedback: gradeForm.feedback,
                assignmentIndex: parseInt(assignmentIndex)
            })

            if (res.data.success) {
                setMessage(res.data.success)
                setType("success")
            } else if (res.data.error) {
                setMessage(res.data.error)
                setType("error")
            } else if (res.data.warning) {
                setMessage(res.data.warning)
                setType("warning")
            }
            setGradingSubmission(null)
            setGradeForm({ score: '', feedback: '' })
            fetchData() // Refresh submissions
        } catch (error) {

            if (error.response?.data?.error) {
                setMessage(error.response.data.error)
                setType("error")
            } else if (error.response?.data?.warning) {
                setMessage(error.response.data.warning)
                setType("warning")
            } else {
                setMessage("Failed to grade submission")
                setType("error")
            }
        }
    }

    const getAssignment = () => {
        return lesson?.assignments?.[parseInt(assignmentIndex)]
    }

    const getSubmissionForAssignment = (submission) => {
        return submission.answers?.[parseInt(assignmentIndex)]
    }

    if (loading) {
        return <Loader text="Loading grading data..." />
    }

    const assignment = getAssignment()
    if (!assignment) {
        return <div style={{ padding: '20px' }}>Assignment not found</div>
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1>📊 Grade Submissions</h1>
                    <p style={{ color: '#666', margin: '5px 0' }}>
                        Lesson: {lesson?.title} • Assignment: {assignment.title}
                    </p>
                </div>
                <button
                    onClick={() => navigate(`/teacher/lessons/${lessonId}`)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    ← Back to Lesson
                </button>
            </div>

            <Toast
                message={message}
                type={type}
                onClose={() => setMessage("")}
            />

            {/* Assignment Details */}
            <div style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '30px',
                backgroundColor: '#f8f9fa'
            }}>
                <h3>📝 Assignment Details</h3>
                <p><strong>Title:</strong> {assignment.title}</p>
                <p><strong>Description:</strong> {assignment.description}</p>
                <p><strong>Type:</strong> {assignment.type}</p>
                <p><strong>Points:</strong> {assignment.points}</p>
                {assignment.dueDate && <p><strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleDateString()}</p>}
            </div>

            {/* Grading Modal */}
            {gradingSubmission && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '20px',
                        width: '500px',
                        maxWidth: '90%'
                    }}>
                        <h3>Grade Submission</h3>
                        <p><strong>Student:</strong> {gradingSubmission.studentId?.name}</p>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Score (out of {assignment.points}):
                            </label>
                            <input
                                type="number"
                                value={gradeForm.score}
                                onChange={(e) => setGradeForm(prev => ({ ...prev, score: e.target.value }))}
                                min="0"
                                max={assignment.points}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Feedback:
                            </label>
                            <textarea
                                value={gradeForm.feedback}
                                onChange={(e) => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setGradingSubmission(null)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGradeSubmission}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Submit Grade
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Submissions List */}
            <div>
                <h2>📨 Student Submissions ({submissions.length})</h2>

                {submissions.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        border: '2px dashed #ddd',
                        borderRadius: '8px',
                        color: '#666'
                    }}>
                        <h3>No submissions yet</h3>
                        <p>Students haven't submitted this assignment yet</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {submissions.map((submission) => {
                            const assignmentSubmission = getSubmissionForAssignment(submission)
                            return (
                                <div key={submission._id} style={{
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    backgroundColor: 'white',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                                                {submission.studentId?.name} ({submission.studentId?.enrollment})
                                            </h4>
                                            <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#666' }}>
                                                <span>📅 Submitted: {new Date(submission.createdAt).toLocaleDateString()}</span>
                                                <span>📊 Status: {assignmentSubmission?.graded ? 'Graded' : 'Pending'}</span>
                                                {assignmentSubmission?.graded && (
                                                    <span>⭐ Score: {assignmentSubmission.score}/{assignment.points}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => {
                                                    setGradingSubmission(submission)
                                                    setGradeForm({
                                                        score: assignmentSubmission?.score?.toString() || '',
                                                        feedback: assignmentSubmission?.feedback || ''
                                                    })
                                                }}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: assignmentSubmission?.graded ? '#ffc107' : '#28a745',
                                                    color: assignmentSubmission?.graded ? 'black' : 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {assignmentSubmission?.graded ? 'Update Grade' : 'Grade'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submission Content */}
                                    {assignmentSubmission && (
                                        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                                            <h5>Submission Content:</h5>
                                            {assignment.type === 'text' || assignment.type === 'essay' ? (
                                                <p style={{ whiteSpace: 'pre-wrap', margin: '10px 0' }}>
                                                    {assignmentSubmission.content || 'No content submitted'}
                                                </p>
                                            ) : assignment.type === 'file_upload' ? (
                                                <div>
                                                    {assignmentSubmission.files?.length > 0 ? (
                                                        assignmentSubmission.files.map((file, index) => (
                                                            <div key={index} style={{ margin: '5px 0' }}>
                                                                📎 <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p>No files submitted</p>
                                                    )}
                                                </div>
                                            ) : assignment.type === 'quiz' ? (
                                                <div>
                                                    {assignmentSubmission.answers?.map((answer, index) => (
                                                        <div key={index} style={{ margin: '5px 0' }}>
                                                            <strong>Q{index + 1}:</strong> {answer}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p>Unsupported assignment type</p>
                                            )}

                                            {assignmentSubmission.feedback && (
                                                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                                                    <strong>Teacher Feedback:</strong>
                                                    <p style={{ margin: '5px 0 0 0' }}>{assignmentSubmission.feedback}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AssignmentGrading