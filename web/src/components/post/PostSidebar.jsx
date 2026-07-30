import { Link } from 'react-router-dom';

import SidebarTag from '../common/SidebarTag.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { API_BASE_URL } from '../../api/client.js';
import { getAvatarColor } from '../../utils/avatarColor.js';

export default function PostSidebar({ contributors }) {
    const { isLoggedIn } = useAuth();

    return (
        <aside className="posts-sidebar">
            <div className="sidebar-box sidebar-info">
                <SidebarTag color="tag-yellow">Info</SidebarTag>
                <p>
                    안녕하세요,<br />
                    <strong>BABBLE.</strong> 게시판입니다.<br />
                    머릿속에 떠오른 아무 말이나 편하게 남겨보세요.
                </p>
            </div>

            {isLoggedIn ? (
                <Link className="write-button" to="/posts/new">✎ 게시글 작성</Link>
            ) : (
                <div className="sidebar-auth-links">
                    <Link className="pastel-button pastel-blue" to="/login">로그인</Link>
                    <Link className="pastel-button pastel-pink" to="/signup">회원가입</Link>
                </div>
            )}

            <div className="sidebar-box sidebar-contributors">
                <SidebarTag color="tag-mint">Contributors</SidebarTag>
                <ul className="contributor-grid">
                    {contributors.map(({ userId, nickname, profileImage }) => (
                        <li
                            key={userId}
                            className="contributor-avatar"
                            title={nickname}
                            style={{ '--avatar-color': getAvatarColor(userId) }}
                        >
                            {profileImage
                                ? <img src={`${API_BASE_URL}${profileImage}`} alt="" />
                                : nickname.charAt(0)}
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
