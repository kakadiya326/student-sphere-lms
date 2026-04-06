import axios from "axios"
import { getToken } from "../utils/storage"

const api = axios.create({
    baseURL: "https://lms-apis-ht78.onrender.com/api"
})

api.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config
})

export default api