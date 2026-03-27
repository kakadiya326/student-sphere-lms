import api from "./api"

export const getTeacherProfile = () => {
    return api.get("/teacher/")
}

export const updateTeacherProfile = (data) => {
    return api.put("/teacher/", data)
}