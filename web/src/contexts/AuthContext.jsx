import { createContext, useState } from 'react';
import { isTokenExpired } from '../utils/jwt';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [ accessToken, setAccessToken ] = useState(localStorage.getItem('accessToken'));
    const isLoggedIn = !!accessToken && !isTokenExpired(accessToken);

    function login(token) {
        setAccessToken(token);
        localStorage.setItem('accessToken', token);
    }

    function logout() {
        setAccessToken(null);
        localStorage.removeItem('accessToken');
    }

    return (
        <AuthContext.Provider value={{ accessToken, isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
