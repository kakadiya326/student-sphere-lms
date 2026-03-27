import { getToken } from "./storage"
import {jwtDecode} from 'jwt-decode'

export const getUserFromToken = () => {
    const token = getToken()

    if (!token) return null

    try {
        return jwtDecode(token)
    } catch {
        return null
    }
}