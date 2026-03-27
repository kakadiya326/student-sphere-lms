import React, { useEffect, useState } from 'react'
import { getMySubjects, updateProgress } from '../../services/studentService'
import Toast from '../../components/Toast'

const MySubjects = () => {
    const [subjects, setSubjects] = useState([])
    const [progress, setProgress] = useState([])
    const [message, setMessage] = useState("")
    const [type, setType] = useState("")

    const fetchData = async () => {
        try {
            const res = await getMySubjects()
            setSubjects(res.data.subjects)
            setProgress(res.data.progress)

        } catch {
            setMessage("Failed to load")
            setType("error")
        }
    }

    useEffect(() => {
        fetchData(); // eslint-disable-line react-hooks/set-state-in-effect
    }, [])

    const handleProgress = async (courseId) => {
        try {
            await updateProgress({ courseId, completedLessons: 1 })

            setMessage("Progress updated")
            setType("success")
        } catch (error) {
            console.log(error);
            setMessage("Error updating")
            setType("error")

        }
    }

    const getProgress = (id) => {
        let p = progress.find(p => p.courseId === id)
        return p ? p.completedLessons : 0
    }
    return (
        <div>
            <h2>My Subjects</h2>
            <Toast
                msgText={message}
                msgType={type}
                clearMessage={() => setMessage("")}
            />

            <ul>
                {subjects.map((subject) => (
                    <li key={subject._id}>
                        {subject.name} ({subject.code})
                        Progress : {getProgress(subject._id)}
                        <button onClick={() => handleProgress(subject._id)}>
                            +1 Lesson
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default MySubjects