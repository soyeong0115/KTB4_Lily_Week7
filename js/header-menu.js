import { request } from './api.js';

const TAG_COLORS = ['tag-yellow', 'tag-pink', 'tag-mint', 'tag-blue', 'tag-lilac'];

const headerRight = document.querySelector('.header-right');
const sidebarAuth = document.querySelector('.sidebar-auth-links');
const accessToken = localStorage.getItem('accessToken');

if (accessToken && headerRight) {
    renderProfileAvatar();
} else if (headerRight) {
    headerRight.style.display = 'none';
}

if (accessToken && sidebarAuth) {
    sidebarAuth.style.display = 'none';
}

async function renderProfileAvatar() {
    let profileImage = null;

    try {
        const profile = await request('/user/profile', { method: 'GET' });
        profileImage = profile.profileImage;
    } catch (error) {
        console.error(error);
    }

    const randomTagColor = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];

    const avatarContent = profileImage
        ? `<img src="http://localhost:8080${profileImage}" alt="" />`
        : '';

    headerRight.innerHTML = `
        <summary class="profile-avatar ${profileImage ? '' : randomTagColor}">${avatarContent}</summary>
        <nav class="brand-dropdown">
            <a href="#" id="header-logout">로그아웃</a>
            <a href="./profile-edit.html">회원정보수정</a>
            <a href="./password-edit.html">비밀번호수정</a>
        </nav>
    `;

    document.getElementById('header-logout').addEventListener('click', (event) => {
        event.preventDefault();
        localStorage.removeItem('accessToken');
        window.location.href = './index.html';
    });
}
