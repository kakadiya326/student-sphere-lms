import React, { useEffect, useState } from 'react'
import { getTeacherProfile, updateTeacherProfile } from '../../services/teacherService'
import Toast from '../../components/Toast'

const MyProfile = () => {
    const [profile, setProfile] = useState({})
    const [form, setForm] = useState({ department: '' })
    const [message, setMessage] = useState("")
    const [type, setType] = useState("")
    const [loading, setLoading] = useState(true)

    const fetchProfile = async () => {
        try {
            const res = await getTeacherProfile()
            setProfile(res.data.teacher || {})
            setForm({ department: res.data.teacher?.department || '' })
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await updateTeacherProfile(form)
            setMessage("Profile updated successfully")
            setType("success")
            fetchProfile() // Refresh profile
        } catch (error) {
            console.log(error)
            setMessage("Error updating profile")
            setType("error")
        }
    }

    if (loading) {
        return <div style={{ padding: '20px' }}>Loading...</div>
    }

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>👨‍🏫 My Profile</h1>

            <Toast
                msgText={message}
                msgType={type}
                clearMessage={() => setMessage("")}
            />

            <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Department:</label>
                    <select
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        required
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
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
                <button
                    type="submit"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Update Profile
                </button>
            </form>

            {profile && (
                <div style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa'
                }}>
                    <h2>Current Profile</h2>
                    <p><strong>Name:</strong> {profile.userId?.name}</p>
                    <p><strong>Email:</strong> {profile.userId?.email}</p>
                    <p><strong>Department:</strong> {profile.department}</p>
                    <p><strong>Subjects:</strong> {profile.subjects?.length || 0}</p>
                </div>
            )}
        </div>
    )
}

export default MyProfile