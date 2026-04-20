import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTeacherLessonsBySubject, createLesson, updateLesson, deleteLesson, reorderLessons } from '../../services/lessonService'
import Toast from '../../components/Toast'
import Loader from '../../components/Loader'

const TeacherLessons = () => {
    const { subjectId } = useParams()
    const navigate = useNavigate()
    const [lessons, setLessons] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [type, setType] = useState("")
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingLessonId, setEditingLessonId] = useState(null)
    const [isReorderMode, setIsReorderMode] = useState(false)
    const [draggedLesson, setDraggedLesson] = useState(null)
    const [lessonForm, setLessonForm] = useState({
        title: "",
        description: "",
        content: "",
        duration: 0,
    })
    const fetchData = async () => {
        try {
            const res = await getTeacherLessonsBySubject(subjectId)
            setLessons(res.data.lessons || [])
        } catch (error) {

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

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setLessonForm(prev => ({
            ...prev,
            [name]: name === 'duration' ? parseInt(value) || 0 : value
        }))
    }

    const handleDragStart = (e, lesson) => {
        setDraggedLesson(lesson)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = async (e, targetLesson) => {
        e.preventDefault()
        if (!draggedLesson || draggedLesson._id === targetLesson._id) {
            setDraggedLesson(null)
            return
        }

        // Reorder lessons array
        const draggedIndex = lessons.findIndex(l => l._id === draggedLesson._id)
        const targetIndex = lessons.findIndex(l => l._id === targetLesson._id)

        const newLessons = [...lessons]
        newLessons.splice(draggedIndex, 1)
        newLessons.splice(targetIndex, 0, draggedLesson)

        // Update order numbers
        const lessonOrders = newLessons.map((lesson, index) => ({
            lessonId: lesson._id,
            order: index
        }))

        try {
            await reorderLessons({
                subjectId: subjectId,
                lessonOrders: lessonOrders
            })
            setLessons(newLessons)
            setMessage("Lessons reordered successfully")
            setType("success")
        } catch (error) {

            setMessage("Failed to reorder lessons")
            setType("error")
        }

        setDraggedLesson(null)
    }

    const resetForm = () => {
        setLessonForm({
            title: "",
            description: "",
            content: "",
            duration: 0
        })
        setEditingLessonId(null)
        setShowCreateForm(false)
    }

    const handleEditLesson = (lesson) => {
        setLessonForm({
            title: lesson.title,
            description: lesson.description || "",
            content: lesson.content || "",
            duration: lesson.duration || 0
        })
        setEditingLessonId(lesson._id)
        setShowCreateForm(true)
    }

    const handleSaveLesson = async (e) => {
        e.preventDefault()
        if (!lessonForm.title.trim() || !lessonForm.description.trim() || !lessonForm.content.trim()) {
            setMessage("All fields are required")
            setType("error")
            return
        }

        try {
            if (editingLessonId) {
                const res = await updateLesson(editingLessonId, lessonForm)
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
                const formData = new FormData()

                formData.append("title", lessonForm.title)
                formData.append("description", lessonForm.description)
                formData.append("content", lessonForm.content)
                formData.append("subjectId", subjectId)
                formData.append("duration", lessonForm.duration)

                // 🔥 MUST stringify arrays
                // formData.append("assignments", JSON.stringify(lessonForm.assignments))
                // formData.append("resources", JSON.stringify(lessonForm.resources))
                const res = await createLesson(
                    formData
                )
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
            resetForm()
            fetchData()
        } catch (error) {

            if (error.response?.data?.error) {
                setMessage(error.response.data.error)
                setType("error")
            } else if (error.response?.data?.warning) {
                setMessage(error.response.data.warning)
                setType("warning")
            } else {
                setMessage(editingLessonId ? "Failed to update lesson" : "Failed to create lesson")
                setType("error")
            }
        }
    }

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm("Are you sure you want to delete this lesson?")) return

        try {
            await deleteLesson(lessonId)
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
            fetchData() // Refresh list
        } catch (error) {

            if (error.response?.data?.error) {
                setMessage(error.response.data.error)
                setType("error")
            } else if (error.response?.data?.warning) {
                setMessage(error.response.data.warning)
                setType("warning")
            } else {
                setMessage("Failed to delete lesson")
                setType("error")
            }
        }
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1>📚 Lessons</h1>
                    <p style={{ color: '#666', margin: '5px 0' }}>Subject ID: {subjectId}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setIsReorderMode(!isReorderMode)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: isReorderMode ? '#ffc107' : '#6c757d',
                            color: isReorderMode ? 'black' : 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {isReorderMode ? '✓ Done Reordering' : '↕️ Reorder Lessons'}
                    </button>
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
            </div>

            <Toast
                message={message}
                type={type}
                onClose={() => setMessage("")}
            />

            {showCreateForm && (
                <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '30px',
                    backgroundColor: '#f8f9fa'
                }}>
                    <h3>{editingLessonId ? 'Edit Lesson' : 'Create New Lesson'}</h3>
                    <form onSubmit={handleSaveLesson}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Lesson Title: *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={lessonForm.title}
                                onChange={handleFormChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="Enter lesson title"
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Description: *
                            </label>
                            <textarea
                                name="description"
                                value={lessonForm.description}
                                onChange={handleFormChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    minHeight: '80px',
                                    boxSizing: 'border-box',
                                    fontFamily: 'Arial'
                                }}
                                placeholder="Enter lesson description"
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Content: *
                            </label>
                            <textarea
                                name="content"
                                value={lessonForm.content}
                                onChange={handleFormChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    minHeight: '150px',
                                    boxSizing: 'border-box',
                                    fontFamily: 'Arial'
                                }}
                                placeholder="Enter lesson content (text, video links, etc.)"
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Duration (minutes):
                            </label>
                            <input
                                type="number"
                                name="duration"
                                value={lessonForm.duration}
                                onChange={handleFormChange}
                                min="0"
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="Estimated duration in minutes"
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
                                {editingLessonId ? 'Update Lesson' : 'Create Lesson'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
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
                {loading ? (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                        <Loader text="Loading lessons..." />
                    </div>
                ) : lessons.length === 0 ? (
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
                        <div key={lesson._id}
                            draggable={isReorderMode}
                            onDragStart={(e) => handleDragStart(e, lesson)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, lesson)}
                            style={{
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                padding: '20px',
                                backgroundColor: draggedLesson?._id === lesson._id ? '#f0f0f0' : 'white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                opacity: draggedLesson?._id === lesson._id ? 0.5 : 1,
                                cursor: isReorderMode ? 'grab' : 'default',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-3px)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                                        {isReorderMode && <span style={{ marginRight: '10px' }}>☰</span>}
                                        {index + 1}. {lesson.title}
                                    </h3>
                                    <p style={{ margin: '8px 0', color: '#555', fontSize: '14px' }}>
                                        {lesson.description}
                                    </p>
                                    <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#666', marginTop: '10px' }}>
                                        <span>📝 {lesson.assignments?.length || 0} assignments</span>
                                        <span>⏱️ {lesson.duration || 0} minutes</span>
                                        <span>👥 {lesson.studentCount || 0} students</span>
                                        <span>📅 {new Date(lesson.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                    <button
                                        onClick={() => navigate(`/teacher/lessons/${lesson._id}`)}
                                        style={{
                                            padding: '8px 12px',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Manage
                                    </button>
                                    <button
                                        onClick={() => handleEditLesson(lesson)}
                                        style={{
                                            padding: '8px 12px',
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
                                        onClick={() => handleDeleteLesson(lesson._id)}
                                        style={{
                                            padding: '8px 12px',
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
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