import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
    // TODO: accessToken 없으면 로그인 페이지로 리다이렉트
    const { isLoggedIn } = useAuth();
    
    return isLoggedIn ? children : <Navigate to="/login" />;
}
