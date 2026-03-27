import api from "./api"

export const getAllSubjects = () => {
    return api.get("/student/subject")
}

export const enrollSubject = (courseId) => {
    return api.put("/student/enroll", { courseId })
}

export const getMySubjects = () => {
    return api.get("/student/mysubjects")
}

export const updateProgress = (data) => {
    return api.post("/student/progress", data)
}

export const unEnrollSubject = (courseId) => {
    return api.put("/student/unenroll", { courseId })
}
export const getStudentProfile = () => {
    return api.get('/student/profile')
}

export const updateStudentProfile = (data) => {
    return api.post('/student/profile', data)
}