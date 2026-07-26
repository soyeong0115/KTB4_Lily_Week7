import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AuthMenu() {
    const { isLoggedIn, logout } = useAuth();
    // TODO: 로그인 상태에 따라 ProfileDropdown 분기
    return isLoggedIn ? (
        <button onClick={logout}>로그아웃</button>
    ) : (
        <>
            <Link to="/login">로그인</Link>
            <Link to="/signup">회원가입</Link>
        </>
    );
}
