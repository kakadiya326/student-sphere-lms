import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    enrollSubject,
    getAllSubjects,
    getMySubjects,
    unEnrollSubject
} from '../../services/studentService'
import Toast from '../../components/Toast'
import '../../styles/Subjects.css'
import { removeToken } from '../../utils/storage'

const Subjects = () => {
    const navigate = useNavigate()
    const [subjects, setSubjects] = useState([])
    const [mySubjects, setMySubjects] = useState([])
    const [message, setMessage] = useState("")
    const [type, setType] = useState("")
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterByStatus, setFilterByStatus] = useState("all") // all, enrolled, available

    // ✅ Fetch both all subjects + enrolled subjects
    const fetchSubjects = () => {
        setLoading(true)
        Promise.all([getAllSubjects(), getMySubjects()])
            .then(([res, mysub]) => {
                setSubjects(res.data.subjects || [])
                setMySubjects(mysub.data.subjects || [])
                setLoading(false)
            })
            .catch((error) => {

                if (error.response && error.response.status === 401) {
                    setMessage("Session expired. Please login again.")
                    setType("error")
                    removeToken()
                    navigate('/')
                } else if (error.response && error.response.status === 403) {
                    setMessage("You don't have permission to view subjects.")
                    setType("error")
                } else {
                    setMessage(error.response?.data?.message || "Failed to load subjects")
                    setType("error")
                }
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchSubjects()
    }, [])

    // ✅ Check if already enrolled
    const isEnrolled = (id) => {
        return mySubjects.some(sub => sub._id === id)
    }

    // ✅ Enroll
    const handleEnroll = (id) => {
        enrollSubject(id)
            .then(() => {
                setMessage("Enrolled successfully!")
                setType("success")
                fetchSubjects() // refresh UI
            })
            .catch((error) => {

                if (error.response && error.response.status === 401) {
                    setMessage("Session expired. Please login again.")
                    setType("error")
                    removeToken()
                    navigate('/')
                } else if (error.response && error.response.status === 403) {
                    setMessage("You don't have permission to enroll.")
                    setType("error")
                } else {
                    setMessage(error.response?.data?.message || "Enrollment failed")
                    setType("error")
                }
            })
    }

    // ✅ Unenroll
    const handleUnenroll = (id) => {
        unEnrollSubject(id)
            .then(() => {
                setMessage("Unenrolled successfully!")
                setType("success")
                fetchSubjects() // refresh UI
            })
            .catch((error) => {

                if (error.response && error.response.status === 401) {
                    setMessage("Session expired. Please login again.")
                    setType("error")
                    removeToken()
                    navigate('/')
                } else if (error.response && error.response.status === 403) {
                    setMessage("You don't have permission to unenroll.")
                    setType("error")
                } else {
                    setMessage(error.response?.data?.message || "Unenroll failed")
                    setType("error")
                }
            })
    }

    // ✅ Filter and search subjects
    const filteredSubjects = subjects.filter(subject => {
        const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subject.code.toLowerCase().includes(searchTerm.toLowerCase())

        if (filterByStatus === "enrolled") {
            return matchesSearch && isEnrolled(subject._id)
        } else if (filterByStatus === "available") {
            return matchesSearch && !isEnrolled(subject._id)
        }
        return matchesSearch
    })

    return (
        <div className="subjects-container">
            <div className="subjects-header">
                <h1 className="subjects-title">📚 Browse Subjects</h1>
                <p className="subjects-subtitle">
                    Explore and enroll in available subjects to start your learning journey.
                </p>
            </div>

            <div className="subjects-actions">
                <button
                    onClick={() => navigate('/student')}
                    className="btn-subjects-secondary"
                >
                    ← Back to Dashboard
                </button>
            </div>

            <Toast
                msgText={message}
                msgType={type}
                clearMessage={() => setMessage("")}
            />

            {/* Stats Section */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number">{subjects.length}</div>
                    <div className="stat-label">Total Subjects</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{mySubjects.length}</div>
                    <div className="stat-label">Enrolled</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{subjects.length - mySubjects.length}</div>
                    <div className="stat-label">Available</div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="filter-section">
                <div className="filter-group">
                    <label className="filter-label">Search Subjects</label>
                    <input
                        type="text"
                        placeholder="Search by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="filter-input"
                    />
                </div>
                <div className="filter-group">
                    <label className="filter-label">Filter by Status</label>
                    <select
                        value={filterByStatus}
                        onChange={(e) => setFilterByStatus(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Subjects</option>
                        <option value="available">Available</option>
                        <option value="enrolled">Enrolled</option>
                    </select>
                </div>
            </div>

            {/* Subjects Grid */}
            <div className="subjects-grid">
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                    </div>
                ) : filteredSubjects.length > 0 ? (
                    filteredSubjects.map((subject) => {
                        const enrolled = isEnrolled(subject._id)
                        return (
                            <div key={subject._id} className="subject-card">
                                <div className="subject-header">
                                    <div>
                                        <h3 className="subject-title">{subject.name}</h3>
                                        <p className="subject-code">{subject.code}</p>
                                    </div>
                                    <span className={`subject-status ${enrolled ? 'status-enrolled' : 'status-available'}`}>
                                        {enrolled ? 'Enrolled' : 'Available'}
                                    </span>
                                </div>

                                <div className="subject-content">
                                    <p className="subject-description">{subject.description}</p>

                                    <div className="subject-details">
                                        <div className="subject-detail">
                                            <span className="detail-label">Teacher</span>
                                            <span className="subject-value">{subject.teacherId?.userId?.name || 'Not assigned'}</span>
                                        </div>
                                        <div className="subject-detail">
                                            <span className="detail-label">Lessons</span>
                                            <span className="subject-value">{subject.lessons?.length || 0}</span>
                                        </div>
                                        <div className="subject-detail">
                                            <span className="detail-label">Students</span>
                                            <span className="subject-value">{subject.enrolledStudents?.length || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="subject-actions">
                                    {enrolled ? (
                                        <>
                                            <button
                                                onClick={() => navigate(`/student/subjects/${subject._id}/lessons`)}
                                                className="btn-subject btn-subject-primary"
                                            >
                                                📚 View Lessons
                                            </button>
                                            <button
                                                onClick={() => handleUnenroll(subject._id)}
                                                className="btn-subject btn-subject-secondary"
                                            >
                                                ❌ Unenroll
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleEnroll(subject._id)}
                                            className="btn-subject btn-subject-success"
                                        >
                                            ✅ Enroll
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="empty-state">
                        <h3>No subjects found</h3>
                        <p>Try adjusting your search or filter criteria.</p>
                        <button
                            onClick={() => {
                                setSearchTerm('')
                                setFilterByStatus('all')
                            }}
                            className="btn-empty"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Subjects