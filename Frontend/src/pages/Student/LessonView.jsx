import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLesson, submitAssignment, getStudentSubmissions, markLessonComplete } from '../../services/lessonService'
import Toast from '../../components/Toast'

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
            setMessage("Failed to load lesson")
            setType("error")
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

        if (!answer || (assignment.type === 'text' && !answer.content?.trim())) {
            setMessage("Please complete the assignment before submitting")
            setType("error")
            return
        }

        setSubmitting(true)
        try {
            await submitAssignment({
                lessonId: lessonId,
                assignmentIndex: assignmentIndex,
                answer: answer
            })

            setMessage("Assignment submitted successfully!")
            setType("success")
            fetchData() // Refresh submissions

            // Move to next assignment or mark lesson complete
            if (assignmentIndex < lesson.assignments.length - 1) {
                setCurrentAssignment(assignmentIndex + 1)
            } else {
                // Check if all assignments are completed
                const allCompleted = lesson.assignments.every((_, index) => assignmentAnswers[index])
                if (allCompleted) {
                    await markLessonComplete({ lessonId })
                    setMessage("Lesson completed! 🎉")
                    setType("success")
                }
            }
        } catch (error) {
            console.log(error)
            setMessage("Failed to submit assignment")
            setType("error")
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

    const isAssignmentSubmitted = (assignmentIndex) => {
        return submissions.some(s => s.answers && s.answers[assignmentIndex])
    }

    const getAssignmentGrade = (assignmentIndex) => {
        const submission = submissions.find(s => s.answers && s.answers[assignmentIndex])
        return submission?.answers?.[assignmentIndex]
    }

    if (loading) {
        return <div style={{ padding: '20px' }}>Loading...</div>
    }

    if (!lesson) {
        return <div style={{ padding: '20px' }}>Lesson not found</div>
    }

    const assignment = lesson.assignments?.[currentAssignment]
    const isSubmitted = isAssignmentSubmitted(currentAssignment)
    const grade = getAssignmentGrade(currentAssignment)

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1>📖 {lesson.title}</h1>
                    <p style={{ color: '#666', margin: '5px 0' }}>
                        Subject: {lesson.subjectId?.name}
                    </p>
                </div>
                <button
                    onClick={() => navigate(`/student/subjects/${lesson.subjectId._id}/lessons`)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    ← Back to Lessons
                </button>
            </div>

            <Toast
                msgText={message}
                msgType={type}
                clearMessage={() => setMessage("")}
            />

            {/* Assignment Navigation */}
            {lesson.assignments?.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                    <h3>📝 Assignments</h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {lesson.assignments.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentAssignment(index)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: currentAssignment === index ? '#007bff' : '#f8f9fa',
                                    color: currentAssignment === index ? 'white' : '#333',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {index + 1}. {isAssignmentSubmitted(index) ? '✅' : '⏳'}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Assignment Content */}
            {assignment ? (
                <div style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                        <div>
                            <h2>{assignment.title}</h2>
                            <p style={{ color: '#666', margin: '5px 0' }}>{assignment.description}</p>
                            <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#666' }}>
                                <span>📋 Type: {assignment.type}</span>
                                {assignment.points > 0 && <span>⭐ Points: {assignment.points}</span>}
                                {assignment.dueDate && <span>📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>}
                            </div>
                        </div>
                        {isSubmitted && grade && (
                            <div style={{
                                padding: '10px',
                                backgroundColor: '#d4edda',
                                border: '1px solid #c3e6cb',
                                borderRadius: '4px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#155724' }}>
                                    Score: {grade.score}/{assignment.points}
                                </div>
                                {grade.feedback && (
                                    <div style={{ fontSize: '14px', marginTop: '5px', color: '#155724' }}>
                                        {grade.feedback}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Assignment Content */}
                    {(assignment.type === 'text' || assignment.type === 'essay') && assignment.content && (
                        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                            <h4>📖 Content:</h4>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                {assignment.content}
                            </div>
                        </div>
                    )}

                    {/* Assignment Attachments */}
                    {assignment.attachments?.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <h4>📎 Attachments:</h4>
                            {assignment.attachments.map((attachment, index) => (
                                <div key={index} style={{ margin: '5px 0' }}>
                                    📎 <a href={attachment.url} target="_blank" rel="noopener noreferrer">{attachment.name}</a>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Assignment Submission */}
                    {!isSubmitted ? (
                        <div style={{ marginTop: '20px' }}>
                            <h4>✍️ Your Submission:</h4>

                            {assignment.type === 'text' || assignment.type === 'essay' ? (
                                <div>
                                    <textarea
                                        value={assignmentAnswers[currentAssignment]?.content || ''}
                                        onChange={(e) => updateAnswer(currentAssignment, 'content', e.target.value)}
                                        placeholder="Write your answer here..."
                                        rows={10}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>
                            ) : assignment.type === 'file_upload' ? (
                                <div>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files)
                                            updateAnswer(currentAssignment, 'files', files)
                                        }}
                                        style={{ marginBottom: '10px' }}
                                    />
                                    {assignmentAnswers[currentAssignment]?.files?.length > 0 && (
                                        <div>
                                            <p>Selected files:</p>
                                            {assignmentAnswers[currentAssignment].files.map((file, index) => (
                                                <div key={index}>📎 {file.name}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : assignment.type === 'quiz' ? (
                                <div>
                                    {assignment.questions?.map((question, qIndex) => (
                                        <div key={qIndex} style={{ marginBottom: '15px' }}>
                                            <p><strong>Q{qIndex + 1}:</strong> {question.question}</p>
                                            {question.type === 'text' ? (
                                                <input
                                                    type="text"
                                                    value={assignmentAnswers[currentAssignment]?.answers?.[qIndex] || ''}
                                                    onChange={(e) => {
                                                        const answers = assignmentAnswers[currentAssignment]?.answers || []
                                                        answers[qIndex] = e.target.value
                                                        updateAnswer(currentAssignment, 'answers', answers)
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                            ) : (
                                                <select
                                                    value={assignmentAnswers[currentAssignment]?.answers?.[qIndex] || ''}
                                                    onChange={(e) => {
                                                        const answers = assignmentAnswers[currentAssignment]?.answers || []
                                                        answers[qIndex] = e.target.value
                                                        updateAnswer(currentAssignment, 'answers', answers)
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '4px'
                                                    }}
                                                >
                                                    <option value="">Select answer</option>
                                                    {question.options?.map((option, oIndex) => (
                                                        <option key={oIndex} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>Unsupported assignment type</p>
                            )}

                            <div style={{ marginTop: '20px' }}>
                                <button
                                    onClick={() => handleAssignmentSubmit(currentAssignment)}
                                    disabled={submitting}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                        fontSize: '16px'
                                    }}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Assignment'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            marginTop: '20px',
                            padding: '15px',
                            backgroundColor: '#d1ecf1',
                            border: '1px solid #bee5eb',
                            borderRadius: '4px'
                        }}>
                            <h4>✅ Assignment Submitted</h4>
                            <p>You have successfully submitted this assignment.</p>
                            {grade && (
                                <div style={{ marginTop: '10px' }}>
                                    <p><strong>Your Score:</strong> {grade.score}/{assignment.points}</p>
                                    {grade.feedback && <p><strong>Feedback:</strong> {grade.feedback}</p>}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    border: '2px dashed #ddd',
                    borderRadius: '8px',
                    color: '#666'
                }}>
                    <h3>No assignments in this lesson</h3>
                    <p>The teacher hasn't added any assignments yet.</p>
                </div>
            )}

            {/* Navigation */}
            {lesson.assignments?.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                    <button
                        onClick={() => setCurrentAssignment(Math.max(0, currentAssignment - 1))}
                        disabled={currentAssignment === 0}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: currentAssignment === 0 ? '#e9ecef' : '#007bff',
                            color: currentAssignment === 0 ? '#6c757d' : 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: currentAssignment === 0 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        ← Previous
                    </button>
                    <button
                        onClick={() => setCurrentAssignment(Math.min(lesson.assignments.length - 1, currentAssignment + 1))}
                        disabled={currentAssignment === lesson.assignments.length - 1}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: currentAssignment === lesson.assignments.length - 1 ? '#e9ecef' : '#007bff',
                            color: currentAssignment === lesson.assignments.length - 1 ? '#6c757d' : 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: currentAssignment === lesson.assignments.length - 1 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    )
}

export default LessonView