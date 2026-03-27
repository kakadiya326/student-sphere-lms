import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../../services/authService'
import { getToken, setToken } from '../../utils/storage'
import { jwtDecode } from "jwt-decode"
import Toast from '../../components/Toast'
import { getStudentProfile } from '../../services/studentService'
import { getTeacherProfile } from '../../services/teacherService'

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

        } catch (error) {
            console.log(error);
            setMessage("Login failed")
            setType("error")
        }
    }
    return (
        <div>
            <h2>Login</h2>
            <Toast
                msgText={message}
                msgType={type}
                clearMessage={() => setMessage("")}
            />
            <form method='post' onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Enter Email"
                    value={form.email}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Enter Password"
                    value={form.password}
                    onChange={handleChange}
                />
                <button type='submit'>Login</button>

            </form>
        </div>
    )
}

export default Login