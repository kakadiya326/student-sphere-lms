import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLesson, addAssignmentToLesson, updateAssignment } from '../../services/lessonService'
import Toast from '../../components/Toast'
import Loader from '../../components/Loader'

const LessonDetails = () => {
    const { lessonId } = useParams()
    const navigate = useNavigate()
    const [lesson, setLesson] = useState(null)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [type, setType] = useState("")
    const [showAssignmentForm, setShowAssignmentForm] = useState(false)
    const [editingAssignment, setEditingAssignment] = useState(null)
    const [assignmentForm, setAssignmentForm] = useState({
        title: '',
        description: '',
        type: 'text',
        content: '',
        questions: [],
        attachments: [],
        dueDate: '',
        points: 0
    })

    const fetchLesson = async () => {
        try {
            const res = await getLesson(lessonId)
            setLesson(res.data.lesson)
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
        fetchLesson()
    }, [lessonId])

    const handleAssignmentSubmit = async (e) => {
        e.preventDefault()

        try {
            if (editingAssignment !== null) {
                // Update existing assignment
                const res = await updateAssignment(lessonId, editingAssignment, assignmentForm)
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
            } else {
                // Add new assignment
                const res = await addAssignmentToLesson(lessonId, assignmentForm)
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
            }
            setShowAssignmentForm(false)
            setEditingAssignment(null)
            resetAssignmentForm()
            fetchLesson() // Refresh lesson data
        } catch (error) {
            console.log(error)
            if (error.response?.data?.error) {
                setMessage(error.response.data.error)
                setType("error")
            } else if (error.response?.data?.warning) {
                setMessage(error.response.data.warning)
                setType("warning")
            } else {
                setMessage("Failed to save assignment")
                setType("error")
            }
        }
    }

    const resetAssignmentForm = () => {
        setAssignmentForm({
            title: '',
            description: '',
            type: 'text',
            content: '',
            questions: [],
            attachments: [],
            dueDate: '',
            points: 0
        })
    }

    const handleEditAssignment = (index) => {
        const assignment = lesson.assignments[index]
        setAssignmentForm({
            title: assignment.title || '',
            description: assignment.description || '',
            type: assignment.type || 'text',
            content: assignment.content || '',
            questions: assignment.questions || [],
            attachments: assignment.attachments || [],
            dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : '',
            points: assignment.points || 0
        })
        setEditingAssignment(index)
        setShowAssignmentForm(true)
    }

    const addQuestion = () => {
        setAssignmentForm(prev => ({
            ...prev,
            questions: [...prev.questions, {
                question: '',
                type: 'text',
                options: [],
                correctAnswer: ''
            }]
        }))
    }

    const updateQuestion = (index, field, value) => {
        setAssignmentForm(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) =>
                i === index ? { ...q, [field]: value } : q
            )
        }))
    }

    if (loading) {
        return <Loader text="Loading lesson details..." />
    }

    if (!lesson) {
        return <div style={{ padding: '20px' }}>Lesson not found</div>
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1>📖 {lesson.title}</h1>
                    <p style={{ color: '#666', margin: '5px 0' }}>
                        Subject: {lesson.subjectId?.name} • Created: {new Date(lesson.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => navigate(`/teacher/subjects/${lesson.subjectId._id}/lessons`)}
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
                    <button
                        onClick={() => setShowAssignmentForm(!showAssignmentForm)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {showAssignmentForm ? 'Cancel' : '+ Add Assignment'}
                    </button>
                </div>
            </div>

            <Toast
                message={message}
                type={type}
                onClose={() => setMessage("")}
            />

            {showAssignmentForm && (
                <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '30px',
                    backgroundColor: '#f8f9fa'
                }}>
                    <h3>{editingAssignment !== null ? 'Edit Assignment' : 'Add New Assignment'}</h3>
                    <form onSubmit={handleAssignmentSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Title:
                                </label>
                                <input
                                    type="text"
                                    value={assignmentForm.title}
                                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Type:
                                </label>
                                <select
                                    value={assignmentForm.type}
                                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, type: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                >
                                    <option value="text">Text Content</option>
                                    <option value="file_upload">File Upload</option>
                                    <option value="quiz">Quiz</option>
                                    <option value="essay">Essay</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Description:
                            </label>
                            <textarea
                                value={assignmentForm.description}
                                onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>

                        {(assignmentForm.type === 'text' || assignmentForm.type === 'essay') && (
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Content:
                                </label>
                                <textarea
                                    value={assignmentForm.content}
                                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, content: e.target.value }))}
                                    rows={5}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        )}

                        {assignmentForm.type === 'quiz' && (
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Questions:
                                </label>
                                {assignmentForm.questions.map((question, index) => (
                                    <div key={index} style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        padding: '10px',
                                        marginBottom: '10px'
                                    }}>
                                        <input
                                            type="text"
                                            placeholder="Question"
                                            value={question.question}
                                            onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '5px',
                                                marginBottom: '5px',
                                                border: '1px solid #ccc',
                                                borderRadius: '3px'
                                            }}
                                        />
                                        <select
                                            value={question.type}
                                            onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                                            style={{ marginRight: '10px', padding: '5px' }}
                                        >
                                            <option value="text">Text Answer</option>
                                            <option value="multiple_choice">Multiple Choice</option>
                                        </select>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    style={{
                                        padding: '5px 10px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '3px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    + Add Question
                                </button>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Due Date:
                                </label>
                                <input
                                    type="date"
                                    value={assignmentForm.dueDate}
                                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Points:
                                </label>
                                <input
                                    type="number"
                                    value={assignmentForm.points}
                                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                                    min="0"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="submit"
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                {editingAssignment !== null ? 'Update Assignment' : 'Add Assignment'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAssignmentForm(false)
                                    setEditingAssignment(null)
                                    resetAssignmentForm()
                                }}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ marginBottom: '30px' }}>
                <h2>📝 Assignments ({lesson.assignments?.length || 0})</h2>

                {lesson.assignments?.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        border: '2px dashed #ddd',
                        borderRadius: '8px',
                        color: '#666'
                    }}>
                        <h3>No assignments yet</h3>
                        <p>Add assignments to engage your students</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {lesson.assignments.map((assignment, index) => (
                            <div key={index} style={{
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                padding: '20px',
                                backgroundColor: 'white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                                            {assignment.title}
                                        </h4>
                                        <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                                            {assignment.description}
                                        </p>
                                        <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#666' }}>
                                            <span>📋 {assignment.type}</span>
                                            {assignment.points > 0 && <span>⭐ {assignment.points} points</span>}
                                            {assignment.dueDate && (
                                                <span>📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => handleEditAssignment(index)}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#ffc107',
                                                color: 'black',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => navigate(`/teacher/lessons/${lessonId}/assignment/${index}/submissions`)}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#17a2b8',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                        >
                                            View Submissions
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default LessonDetails