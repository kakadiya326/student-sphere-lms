import api from "./api"

export const registerUser = (data) => {
    return api.post('/auth/register', data)
}

export const loginUser = (data) => {
    return api.post("/auth/login", data)
}

export const verifyEmail = (userEmail) => {
    return api.post("/auth/sendotp", userEmail)
}

export const verifyOtp = (data) => {
    return api.post("/auth/verifyotp", data)
}