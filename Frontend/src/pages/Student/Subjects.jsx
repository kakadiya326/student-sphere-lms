import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    enrollSubject,
    getAllSubjects,
    getMySubjects,
    unEnrollSubject
} from '../../services/studentService'
import Toast from '../../components/Toast'

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
    const fetchSubjects = async () => {
        try {
            setLoading(true)
            const res = await getAllSubjects()
            const mysub = await getMySubjects()

            setSubjects(res.data.subjects || [])
            setMySubjects(mysub.data.subjects || [])

        } catch {
            setMessage("Failed to load subjects")
            setType("error")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSubjects()
    }, [])

    // ✅ Check if already enrolled
    const isEnrolled = (id) => {
        return mySubjects.some(sub => sub._id === id)
    }

    // ✅ Enroll
    const handleEnroll = async (id) => {
        try {
            await enrollSubject(id)
            setMessage("Enrolled successfully!")
            setType("success")
            fetchSubjects() // refresh UI
        } catch {
            setMessage("Enrollment failed")
            setType("error")
        }
    }

    // ✅ Unenroll
    const handleUnenroll = async (id) => {
        try {
            await unEnrollSubject(id)
            setMessage("Unenrolled successfully!")
            setType("success")
            fetchSubjects() // refresh UI
        } catch {
            setMessage("Unenroll failed")
            setType("error")
        }
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
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>📚 Browse Subjects</h1>

            <Toast
                msgText={message}
                msgType={type}
                clearMessage={() => setMessage("")}
            />

            {/* Stats Section */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '30px'
            }}>
                <div style={{
                    backgroundColor: '#e7f3ff',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '2px solid #007bff'
                }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#007bff' }}>Total Subjects</h4>
                    <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                        {subjects.length}
                    </p>
                </div>
                <div style={{
                    backgroundColor: '#e8f5e9',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '2px solid #28a745'
                }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#28a745' }}>Enrolled</h4>
                    <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                        {mySubjects.length}
                    </p>
                </div>
                <div style={{
                    backgroundColor: '#fff3e0',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '2px solid #ff9800'
                }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#ff9800' }}>Available</h4>
                    <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>
                        {subjects.length - mySubjects.length}
                    </p>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '25px',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <input
                        type="text"
                        placeholder="Search by subject name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    />
                </div>
                <div>
                    <select
                        value={filterByStatus}
                        onChange={(e) => setFilterByStatus(e.target.value)}
                        style={{
                            padding: '12px',
                            border: '2px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">All Subjects</option>
                        <option value="available">Available to Enroll</option>
                        <option value="enrolled">My Enrolled Subjects</option>
                    </select>
                </div>
            </div>

            {/* Subjects Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Loading subjects...</p>
                </div>
            ) : filteredSubjects.length > 0 ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '20px'
                }}>
                    {filteredSubjects.map((subject) => {
                        const enrolled = isEnrolled(subject._id)
                        return (
                            <div
                                key={subject._id}
                                style={{
                                    border: enrolled ? '2px solid #28a745' : '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    backgroundColor: '#fff',
                                    transition: 'all 0.3s ease',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)'
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            >
                                {enrolled && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}>
                                        ✓ Enrolled
                                    </div>
                                )}

                                <div style={{ marginBottom: '15px' }}>
                                    <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>
                                        {subject.name}
                                    </h3>
                                    <p style={{ margin: '0', color: '#666', fontSize: '13px' }}>
                                        <strong>Code:</strong> {subject.code}
                                    </p>
                                </div>

                                <div style={{
                                    backgroundColor: '#f5f5f5',
                                    padding: '12px',
                                    borderRadius: '4px',
                                    marginBottom: '15px'
                                }}>
                                    <p style={{ margin: '5px 0', fontSize: '13px', color: '#666' }}>
                                        <strong>👨‍🏫 Teacher:</strong> {subject.teacherId?.userId?.name || 'N/A'}
                                    </p>
                                    <p style={{ margin: '5px 0', fontSize: '13px', color: '#666' }}>
                                        <strong>📧 Email:</strong> {subject.teacherId?.userId?.email || 'N/A'}
                                    </p>
                                    <p style={{ margin: '5px 0', fontSize: '13px', color: '#666' }}>
                                        <strong>🏢 Department:</strong> {subject.teacherId?.department || 'N/A'}
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {enrolled ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    const confirm = window.confirm("Are you sure you want to unenroll?");
                                                    if (confirm) {
                                                        handleUnenroll(subject._id);
                                                    }
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    backgroundColor: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Unenroll
                                            </button>
                                            <button
                                                onClick={() => navigate(`/student/subjects/${subject._id}/lessons`)}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    backgroundColor: '#007bff',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                📚 View Lessons
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleEnroll(subject._id)}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                backgroundColor: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Enroll Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '2px dashed #ddd'
                }}>
                    <h3>No subjects found</h3>
                    <p style={{ color: '#666' }}>
                        {searchTerm ? 'Try adjusting your search terms' : 'No subjects available'}
                    </p>
                </div>
            )}
        </div>
    )
}

export default Subjects