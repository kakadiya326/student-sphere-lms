import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTeacherProfile, updateTeacherProfile } from '../../services/teacherService'
import Toast from '../../components/Toast'
import Loader from '../../components/Loader'
import '../../styles/Profile.css'
import { removeToken } from '../../utils/storage'
import api from '../../services/api'

const MyProfile = () => {
    const fileInputRef = useRef()
    const navigate = useNavigate()
    const [profile, setProfile] = useState({})
    const [form, setForm] = useState({ department: '' })
    const [message, setMessage] = useState("")
    const [type, setType] = useState("")
    const [loading, setLoading] = useState(true)
    const [preview, setPreview] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)
    const [uploadedProfilePic, setUploadedProfilePic] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [imageError, setImageError] = useState(false)

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setSelectedFile(file)
        setPreview(URL.createObjectURL(file))
        setImageError(false)
    }

    const saveProfilePic = () => {
        if (!selectedFile) return

        setUploading(true)
        const formData = new FormData()
        formData.append("profilePic", selectedFile)

        api.post(
            "/auth/upload-profile-pic",
            formData
        )
            .then((res) => {
                if (res.data.success) {
                    setMessage(res.data.success)
                    setType("success")
                }
                setSelectedFile(null)
                setPreview(null)
                setImageError(false)

                const newPic = res.data.profilePicPath
                if (newPic) {
                    setUploadedProfilePic(newPic)
                }

                fetchProfile()
            })
            .catch((error) => {

                if (error.response?.data?.error) {
                    setMessage(error.response.data.error)
                    setType("error")
                } else if (error.response?.data?.warning) {
                    setMessage(error.response.data.warning)
                    setType("warning")
                } else {
                    setMessage(error.response?.data?.message || "Error uploading profile picture")
                    setType("error")
                }
            })
            .finally(() => {
                setUploading(false)
            })
    }

    const cancelProfilePic = () => {
        setSelectedFile(null)
        setPreview(null)
        setImageError(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const fetchProfile = () => {
        setLoading(true)
        getTeacherProfile()
            .then((res) => {

                setProfile(res.data.teacher || {})
                setForm({ department: res.data.teacher?.department || '' })
                setLoading(false)
            })
            .catch((error) => {

                if (error.response && error.response.status === 401) {
                    setMessage("Session expired. Please login again.")
                    setType("error")
                    removeToken()
                    navigate('/')
                } else if (error.response && error.response.status === 403) {
                    setMessage("You don't have permission to view this profile.")
                    setType("error")
                } else if (error.response?.data?.error) {
                    setMessage(error.response.data.error)
                    setType("error")
                } else if (error.response?.data?.warning) {
                    setMessage(error.response.data.warning)
                    setType("warning")
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
        updateTeacherProfile(form)
            .then((res) => {
                if (res.data.success) {
                    setMessage(res.data.success)
                    setType("success")
                }
                fetchProfile() // Refresh profile
            })
            .catch((error) => {

                if (error.response && error.response.status === 401) {
                    setMessage("Session expired. Please login again.")
                    setType("error")
                    removeToken()
                    navigate('/')
                } else if (error.response && error.response.status === 403) {
                    setMessage("You don't have permission to update this profile.")
                    setType("error")
                } else if (error.response?.data?.error) {
                    setMessage(error.response.data.error)
                    setType("error")
                } else if (error.response?.data?.warning) {
                    setMessage(error.response.data.warning)
                    setType("warning")
                } else {
                    setMessage(error.response?.data?.message || "Error updating profile")
                    setType("error")
                }
            })
    }

    const profilePicUrl = profile.userId?.profilePic ? `https://lms-apis-ht78.onrender.com/profilePics/${profile.userId.profilePic}?t=${Date.now()}` : null
    const uploadedPicUrl = uploadedProfilePic ? `https://lms-apis-ht78.onrender.com/profilePics/${uploadedProfilePic}?t=${Date.now()}` : null
    const imageUrl = !imageError ? (preview || uploadedPicUrl || profilePicUrl) : null

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1 className="profile-title">👨‍🏫 My Profile</h1>
                <p className="profile-subtitle">
                    Manage your personal information and academic details.
                </p>
            </div>

            <div className="profile-actions">
                <button
                    onClick={() => navigate('/teacher')}
                    className="btn-profile-secondary"
                >
                    ← Back to Dashboard
                </button>
            </div>

            <Toast
                message={message}
                type={type}
                onClose={() => setMessage("")}
            />

            <div className="profile-layout">
                {loading ? (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                        <Loader text="Loading profile..." />
                    </div>
                ) : (
                    <>
                            <div className="profile-sidebar">
                                <div className="profile-picture-section">
                        <div className="profile-picture">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="Profile"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                profile.userId?.name ? profile.userId.name.charAt(0).toUpperCase() : '👤'
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                        <button
                            className="edit-profile-btn"
                            title="Select New Profile Picture"
                            onClick={() => fileInputRef.current.click()}
                        >
                            ✏️
                        </button>

                        {selectedFile && (
                            <div className="profile-picture-button-group">
                                <button
                                    type="button"
                                    className="btn-save"
                                    onClick={saveProfilePic}
                                    disabled={uploading}
                                >
                                    {uploading ? 'Saving...' : 'Save Picture'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={cancelProfilePic}
                                    disabled={uploading}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        <h3 className="profile-name">{profile.userId?.name || 'Teacher'}</h3>
                        <p className="profile-role">Teacher</p>
                    </div>

                    <div className="profile-info">
                        <div className="info-item">
                            <span className="info-label">Email</span>
                            <span className="info-value">{profile.userId?.email}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Department</span>
                            <span className="info-value">{profile.department || 'Not set'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Subjects</span>
                            <span className="info-value">{profile.subjects?.length || 0}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Joined</span>
                            <span className="info-value">{profile.createdAt ? new Date(profile.createdAt).getFullYear() : 'Not set'}</span>
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
                            <h3 className="section-title">📚 Teaching Overview</h3>
                            <p className="section-subtitle">Your teaching statistics</p>
                        </div>
                        <div className="section-body">
                            <div className="progress-overview">
                                <div className="progress-item">
                                    <div className="progress-number">{profile.subjects?.length || 0}</div>
                                    <div className="progress-label">Subjects Taught</div>
                                </div>
                                <div className="progress-item">
                                    <div className="progress-number">0</div>
                                    <div className="progress-label">Total Students</div>
                                </div>
                                <div className="progress-item">
                                    <div className="progress-number">0</div>
                                    <div className="progress-label">Assignments Graded</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default MyProfile