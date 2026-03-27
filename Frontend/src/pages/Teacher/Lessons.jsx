import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLessonsBySubject, createLesson, deleteLesson } from '../../services/lessonService'
import Toast from '../../components/Toast'

const TeacherLessons = () => {
    const { subjectId } = useParams()
    const navigate = useNavigate()
    const [lessons, setLessons] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [type, setType] = useState("")
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newLessonTitle, setNewLessonTitle] = useState("")

    const fetchData = async () => {
        try {
            const res = await getLessonsBySubject(subjectId)
            setLessons(res.data.lessons || [])
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

    const handleCreateLesson = async (e) => {
        e.preventDefault()
        if (!newLessonTitle.trim()) return

        try {
            await createLesson({
                title: newLessonTitle,
                subjectId: subjectId
            })
            setMessage("Lesson created successfully")
            setType("success")
            setNewLessonTitle("")
            setShowCreateForm(false)
            fetchData() // Refresh list
        } catch (error) {
            console.log(error)
            setMessage("Failed to create lesson")
            setType("error")
        }
    }

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm("Are you sure you want to delete this lesson?")) return

        try {
            await deleteLesson(lessonId)
            setMessage("Lesson deleted successfully")
            setType("success")
            fetchData() // Refresh list
        } catch (error) {
            console.log(error)
            setMessage("Failed to delete lesson")
            setType("error")
        }
    }

    if (loading) {
        return <div style={{ padding: '20px' }}>Loading...</div>
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1>📚 Lessons</h1>
                    <p style={{ color: '#666', margin: '5px 0' }}>Subject ID: {subjectId}</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {showCreateForm ? 'Cancel' : '+ New Lesson'}
                </button>
            </div>

            <Toast
                msgText={message}
                msgType={type}
                clearMessage={() => setMessage("")}
            />

            {showCreateForm && (
                <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '30px',
                    backgroundColor: '#f8f9fa'
                }}>
                    <h3>Create New Lesson</h3>
                    <form onSubmit={handleCreateLesson}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Lesson Title:
                            </label>
                            <input
                                type="text"
                                value={newLessonTitle}
                                onChange={(e) => setNewLessonTitle(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                                placeholder="Enter lesson title"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="submit"
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Create Lesson
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
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
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gap: '20px' }}>
                {lessons.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        border: '2px dashed #ddd',
                        borderRadius: '8px',
                        color: '#666'
                    }}>
                        <h3>No lessons created yet</h3>
                        <p>Create your first lesson to get started</p>
                    </div>
                ) : (
                    lessons.map((lesson, index) => (
                        <div key={lesson._id} style={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            padding: '20px',
                            backgroundColor: 'white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                                        {index + 1}. {lesson.title}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#666' }}>
                                        <span>📝 {lesson.assignments?.length || 0} assignments</span>
                                        <span>👥 {lesson.studentCount || 0} students enrolled</span>
                                        <span>📅 Created {new Date(lesson.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => navigate(`/teacher/lessons/${lesson._id}`)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Manage
                                    </button>
                                    <button
                                        onClick={() => handleDeleteLesson(lesson._id)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default TeacherLessons