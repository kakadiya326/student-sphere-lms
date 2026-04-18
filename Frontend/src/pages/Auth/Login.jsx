import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../../services/authService'
import { getToken, setToken } from '../../utils/storage'
import { jwtDecode } from "jwt-decode"
import Toast from '../../components/Toast'
import { getStudentProfile } from '../../services/studentService'
import { getTeacherProfile } from '../../services/teacherService'
import '../../styles/Auth.css'

const Login = () => {
    const [form, setForm] = useState({
        email: "",
        password: "",
    })

    const [message, setMessage] = useState("")
    const [type, setType] = useState("")

    const navigate = useNavigate()

    useEffect(() => {
        const token = getToken()
        if (token) {
            try {
                const user = jwtDecode(token);
                if (user.role === "teacher") {
                    // Check profile
                    getTeacherProfile().then(res => {
                        if (res.data.teacher) {
                            navigate('/teacher')
                        } else {
                            navigate('/complete-teacher-profile')
                        }
                    }).catch(() => {
                        navigate('/complete-teacher-profile')
                    })
                }
                else if (user.role === "student") {
                    // Check profile
                    getStudentProfile().then(res => {
                        if (res.data.student) {
                            navigate('/student')
                        } else {
                            navigate('/complete-profile')
                        }
                    }).catch(() => {
                        navigate('/complete-profile')
                    })
                }
            } catch (error) {
                // Invalid token, remove it and stay on login
                localStorage.removeItem('token')
            }
        }

    }, [navigate])

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const ApiResponse = await loginUser(form);

            const token = ApiResponse.data.token
            setToken(token)

            try {
                const user = jwtDecode(token)

                if (user.role === "teacher") {
                    navigate("/teacher")
                } else if (user.role === "student") {
                    // Check if profile is complete
                    try {
                        const profileRes = await getStudentProfile()
                        if (profileRes.data.student) {
                            navigate("/student")
                        } else {
                            navigate("/complete-profile")
                        }
                    } catch {
                        // If error getting profile, assume not complete
                        navigate("/complete-profile")
                    }
                }

                setMessage("Login successful")
                setType("success")
            } catch (decodeError) {
                console.log(decodeError);
                setMessage("Invalid token received")
                setType("error")
                localStorage.removeItem('token')
            }

        } catch (error) {
            console.log(error);
            if (error.response?.data?.error) {
                setMessage(error.response.data.error)
                setType("error")
            } else if (error.response?.data?.warning) {
                setMessage(error.response.data.warning)
                setType("warning")
            } else {
                setMessage("Login failed")
                setType("error")
            }
        }
    }
    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2 className="auth-title">
                        📚 Welcome Back
                    </h2>
                    <p className="auth-subtitle">
                        Sign in to your StudentSphere account
                    </p>
                </div>

                <Toast
                    message={message}
                    type={type}
                    onClose={() => setMessage("")}
                />

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <button
                        type='submit'
                        className="btn-primary"
                    >
                        Sign In
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?
                    </p>
                    <button
                        onClick={() => navigate('/register')}
                        className="btn-outline-success"
                    >
                        Create Account
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Login