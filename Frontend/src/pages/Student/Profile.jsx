import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStudentProfile, updateStudentProfile } from '../../services/studentService'
import Toast from '../../components/Toast'
import '../../styles/Profile.css'
import { removeToken } from '../../utils/storage'

const StudentProfile = () => {
    const navigate = useNavigate()
    const [profile, setProfile] = useState({})
    const [form, setForm] = useState({ department: '' })
    const [message, setMessage] = useState("")
    const [type, setType] = useState("")
    const [loading, setLoading] = useState(true)
console.log(profile);

    const fetchProfile = () => {
        setLoading(true)
        getStudentProfile()
            .then((res) => {
                setProfile(res.data.student || {})
                setForm({ department: res.data.student?.department || '' })
                setLoading(false)
            })
            .catch((error) => {
                console.log(error)
                if (error.response && error.response.status === 401) {
                    setMessage("Session expired. Please login again.")
                    setType("error")
                    removeToken()
                    navigate('/')
                } else if (error.response && error.response.status === 403) {
                    setMessage("You don't have permission to view this profile.")
                    setType("error")
                } else {
                    setMessage(error.response?.data?.message || "Failed to load profile")
                    setType("error")
                }
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchProfile();
    }, [])

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        updateStudentProfile(form)
            .then(() => {
                setMessage("Profile updated successfully")
                setType("success")
                fetchProfile() // Refresh profile
            })
            .catch((error) => {
                console.log(error)
                if (error.response && error.response.status === 401) {
                    setMessage("Session expired. Please login again.")
                    setType("error")
                    removeToken()
                    navigate('/')
                } else if (error.response && error.response.status === 403) {
                    setMessage("You don't have permission to update this profile.")
                    setType("error")
                } else {
                    setMessage(error.response?.data?.message || "Error updating profile")
                    setType("error")
                }
            })
    }

    if (loading) {
        return <div style={{ padding: '20px' }}>Loading...</div>
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1 className="profile-title">🎓 My Profile</h1>
                <p className="profile-subtitle">
                    Manage your personal information and academic details.
                </p>
            </div>

            <div className="profile-actions">
                <button
                    onClick={() => navigate('/student')}
                    className="btn-profile-secondary"
                >
                    ← Back to Dashboard
                </button>
            </div>

            <Toast
                msgText={message}
                msgType={type}
                clearMessage={() => setMessage("")}
            />

            <div className="profile-layout">
                <div className="profile-sidebar">
                    <div className="profile-picture-section">
                        <div className="profile-picture">
                            {profile.name ? profile.name.charAt(0).toUpperCase() : '👤'}
                        </div>
                        <h3 className="profile-name">{profile._id.name || 'Student'}</h3>
                        <p className="profile-role">Student</p>
                    </div>

                    <div className="profile-info">
                        <div className="info-item">
                            <span className="info-label">Email</span>
                            <span className="info-value">{profile._id.email}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Roll Number</span>
                            <span className="info-value">{profile.enrollment || 'Not set'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Department</span>
                            <span className="info-value">{profile.department || 'Not set'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Year</span>
                            <span className="info-value">{profile.createdAt.split('-')[0] || 'Not set'}</span>
                        </div>
                    </div>
                </div>

                <div className="profile-main">
                    <div className="profile-section">
                        <div className="section-header">
                            <h3 className="section-title">📝 Personal Information</h3>
                            <p className="section-subtitle">Update your personal details</p>
                        </div>
                        <div className="section-body">
                            <form onSubmit={handleSubmit} className="personal-info-form">
                                <div className="form-group">
                                    <label className="form-label">Department</label>
                                    <select
                                        name="department"
                                        value={form.department}
                                        onChange={handleChange}
                                        required
                                        className="form-select"
                                    >
                                        <option value="">Select Department</option>
                                        <option value="CSE">CSE</option>
                                        <option value="IT">IT</option>
                                        <option value="ECE">ECE</option>
                                        <option value="EEE">EEE</option>
                                        <option value="MECH">MECH</option>
                                        <option value="CIVIL">CIVIL</option>
                                        <option value="AI">AI</option>
                                        <option value="DS">DS</option>
                                        <option value="CSBS">CSBS</option>
                                        <option value="MBA">MBA</option>
                                        <option value="BBA">BBA</option>
                                        <option value="BCA">BCA</option>
                                        <option value="MCA">MCA</option>
                                    </select>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn-save" disabled={loading}>
                                        💾 Save Changes
                                    </button>
                                    <button type="button" className="btn-cancel" onClick={() => setForm({ department: profile.department || '' })}>
                                        ❌ Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="profile-section">
                        <div className="section-header">
                            <h3 className="section-title">📊 Academic Progress</h3>
                            <p className="section-subtitle">Your current academic standing</p>
                        </div>
                        <div className="section-body">
                            <div className="progress-overview">
                                <div className="progress-item">
                                    <div className="progress-number">{profile.courseIds?.length || 0}</div>
                                    <div className="progress-label">Enrolled Subjects</div>
                                </div>
                                <div className="progress-item">
                                    <div className="progress-number">{profile.completedSubjects?.length || 0}</div>
                                    <div className="progress-label">Completed Subjects</div>
                                </div>
                                <div className="progress-item">
                                    <div className="progress-number">
                                        {profile.enrolledSubjects?.length > 0 ?
                                            Math.round((profile.completedSubjects?.length || 0) / profile.progress.length * 100) : 0}%
                                    </div>
                                    <div className="progress-label">Overall Progress</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StudentProfile