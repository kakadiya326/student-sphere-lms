import { getToken } from '../utils/storage'
import { Navigate } from 'react-router-dom'
import { jwtDecode } from "jwt-decode"

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = getToken()

    // ❌ No token → redirect
    if (!token) {
        return <Navigate to="/" />
    }

    let user;
    try {
        user = jwtDecode(token);
        // 🔥 Check if token is valid
        // jwtDecode(token)
    } catch {
        return <Navigate to="/" />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={"/unauthorized"} />
    }

    // ✅ Valid token → allow access
    return children
}

export default ProtectedRoute