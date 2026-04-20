import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser, verifyEmail, verifyOtp } from '../../services/authService'
import Toast from '../../components/Toast'
import '../../styles/Auth.css'

const Register = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
        otp: ""
    })

    const [otp, setOtp] = useState(['', '', '', '', '', ''])

    const [step, setStep] = useState('email') // 'email', 'otp', 'form'

    const handleOtpChange = (e, index) => {
        const value = e.target.value.replace(/[^0-9]/g, '')

        let newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        // 🔥 Sync with form (important)
        setForm({
            ...form,
            otp: newOtp.join('')
        })

        if (value && index < 5) {
            const inputs = document.querySelectorAll('.otp-input')
            inputs[index + 1].focus()
        }
    }

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const inputs = document.querySelectorAll('.otp-input')
            inputs[index - 1].focus()
        }
    }

    const [message, setMessage] = useState("")
    const [type, setType] = useState("")
    const [loading, setLoading] = useState(false)
    const [otpLoading, setOtpLoading] = useState(false)

    useEffect(() => {
    }, [step])

    const navigate = useNavigate()

    const redirectToLogin = () => {
        setTimeout(() => navigate('/'), 2000)
    }

    const isDuplicateUserWarning = (text) => {
        if (!text) return false
        const normalized = text.toLowerCase()
        return normalized.includes('already exists') || normalized.includes('please login') || normalized.includes('already registered') || normalized.includes('login instead')
    }

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    }

    const sendOtp = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!form.email.trim()) {
            setMessage("Please enter your email")
            setType("error")
            return
        }
        // Simple email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(form.email.trim())) {
            setMessage("Please enter a valid email address")
            setType("error")
            return
        }

        setOtpLoading(true)
        try {
            const email = form.email.trim().toLowerCase();
            const response = await verifyEmail({ email })

            // Check for warning in response
            if (response.data.warning) {
                setMessage(response.data.warning)
                setType("error")
                if (isDuplicateUserWarning(response.data.warning)) {
                    redirectToLogin()
                }
                return
            }

            // Check for error in response
            if (response.data.error) {
                setMessage(response.data.error)
                setType("error")
                return
            }

            setMessage("OTP sent successfully! Check your email.")
            setType("success")
            // Force state update with timeout to ensure it happens after current tick
            setTimeout(() => {
                setStep('otp')
            }, 100)
        } catch (error) {
            const warning = error.response?.data?.warning
            if (warning) {
                setMessage(warning)
                setType("error")
                if (isDuplicateUserWarning(warning)) {
                    redirectToLogin()
                }
            } else {
                setMessage("Failed to send OTP. Please try again.")
                setType("error")
            }
        } finally {
            setOtpLoading(false)
        }
    }

    const verifyOtpCode = async () => {
        if (form.otp.length !== 6) {
            setMessage("Please enter the complete 6-digit OTP")
            setType("error")
            return
        }

        setOtpLoading(true)
        try {
            const response = await verifyOtp({ email: form.email.trim(), otp: form.otp })

            // Check for warning or error in response
            if (response.data.warning) {
                setMessage(response.data.warning)
                setType("error")
                return
            }

            if (response.data.error) {
                setMessage(response.data.error)
                setType("error")
                return
            }

            setMessage("OTP verified successfully!")
            setType("success")
            setStep('form')
        } catch (error) {
            ('OTP verify error:', error)
            setMessage("Failed to verify OTP. Please try again.")
            setType("error")
        } finally {
            setOtpLoading(false)
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validation
        if (!form.name.trim()) {
            setMessage("Please enter your name")
            setType("error")
            return
        }

        if (!form.email.trim()) {
            setMessage("Please enter your email")
            setType("error")
            return
        }

        if (!form.password) {
            setMessage("Please enter a password")
            setType("error")
            return
        }

        if (form.password.length < 6) {
            setMessage("Password must be at least 6 characters long")
            setType("error")
            return
        }

        if (form.password !== form.confirmPassword) {
            setMessage("Passwords do not match")
            setType("error")
            return
        }

        setLoading(true)

        try {
            await registerUser({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                role: form.role
            });

            setMessage("Registration successful! Please login to continue.")
            setType("success")

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/')
            }, 2000)

        } catch (error) {

            if (error.response?.data?.warning) {
                const warningText = error.response.data.warning
                setMessage(warningText)
                setType("error")
                if (isDuplicateUserWarning(warningText)) {
                    redirectToLogin()
                }
            } else {
                setMessage("Registration failed. Please try again.")
                setType("error")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <h2 className="register-title">
                        📚 Join StudentSphere
                    </h2>
                    <p className="register-subtitle">
                        Create your account to get started
                    </p>
                </div>

                <Toast
                    msgText={message}
                    msgType={type}
                    clearMessage={() => setMessage("")}
                />

                {/* Step Indicator */}
                <div className="step-indicator">
                    <div className={`step-dot ${step === 'email' ? 'active' : ''}`}></div>
                    <div className={`step-dot ${step === 'otp' ? 'active' : ''}`}></div>
                    <div className={`step-dot ${step === 'form' ? 'active' : ''}`}></div>
                </div>

                {/* Dynamic content based on step */}
                <div key={`step-${step}`}>
                    {/* Send OTP Button - Only in email step (outside form to prevent submission) */}
                    {step === 'email' && (
                        <button
                            onClick={sendOtp}
                            type="button"
                            disabled={otpLoading}
                            className="btn-primary"
                            style={{ marginBottom: '24px' }}
                        >
                            {otpLoading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        {/* Email Field - Always shown */}
                        <div className="form-group">
                            <label className="form-label">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                disabled={step !== 'email'}
                                className="form-input"
                                style={{ backgroundColor: step !== 'email' ? '#f8f9fa' : 'white' }}
                            />
                        </div>

                        {/* OTP Section - Only in otp step */}
                        {step === 'otp' && (
                            <div className="form-group">
                                <label className="form-label">
                                    Enter OTP *
                                </label>
                                <div className="otp-container">
                                    {[...Array(6)].map((_, index) => (
                                        <input
                                            className="otp-input"
                                            key={index}
                                            type="text"
                                            maxLength="1"
                                            value={otp[index] || ''}
                                            onChange={(e) => handleOtpChange(e, index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={verifyOtpCode}
                                    type="button"
                                    disabled={otpLoading}
                                    className="btn-primary"
                                    style={{ marginTop: '16px' }}
                                >
                                    {otpLoading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                            </div>
                        )}

                        {/* Rest of form - Only after OTP verification */}
                        {step === 'form' && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter your full name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        I am a *
                                    </label>
                                    <select
                                        name="role"
                                        value={form.role}
                                        onChange={handleChange}
                                        className="form-select"
                                    >
                                        <option value="student">Student</option>
                                        <option value="teacher">Teacher</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Create a password (min 6 characters)"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Confirm Password *
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm your password"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                    />
                                </div>

                                <button
                                    type='submit'
                                    disabled={loading}
                                    className="btn-secondary"
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </>
                        )}
                    </form>
                </div>

                <div className="auth-footer">
                    <p>
                        Already have an account?
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="btn-outline"
                    >
                        Sign In Instead
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Register