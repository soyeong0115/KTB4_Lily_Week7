import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth.js';
import { API_BASE_URL } from '../../api/client.js';
import { getProfile } from '../../api/userApi.js';
import { getAvatarColor } from '../../utils/avatarColor.js';
import { useNotification } from '../../hooks/useNotification.js';

export default function AuthMenu() {
    const { isLoggedIn, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const { notifications } = useNotification();
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    useEffect(() => {
        if (!isLoggedIn) {
            setProfile(null);
            return;
        }

        async function fetchProfile() {
            try {
                const data = await getProfile();
                setProfile(data);
            } catch (error) {
                console.error(error);
            }
        }

        fetchProfile();
    }, [isLoggedIn]);

    if (!isLoggedIn) {
        return null;
    }

    const nickname = profile?.nickname ?? '';
    const avatarColor = getAvatarColor(profile?.userId ?? 0);
    const avatarContent = profile?.profileImage
        ? <img src={`${API_BASE_URL}${profile.profileImage}`} alt="" />
        : nickname.charAt(0);

    function handleLogout(event) {
        event.preventDefault();
        logout();
    }

    return (
        <>
            <Link to="/notifications" className="notification-bell">
                <img className="notification-bell-icon" src="/svg/bell.svg" alt="알림" />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </Link>
            <details className="header-right">
                <summary className="profile-avatar" style={{ '--avatar-color': avatarColor }}>
                    {avatarContent}
                </summary>
                <nav className="brand-dropdown">
                    <a href="#" onClick={handleLogout}>로그아웃</a>
                    <Link to="/profile/edit">회원정보수정</Link>
                    <Link to="/password/edit">비밀번호수정</Link>
                </nav>
            </details>
        </>
    );
}
