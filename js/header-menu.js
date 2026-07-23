import { request, API_BASE_URL } from './api.js';

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
    let nickname = '';

    try {
        const profile = await request('/user/profile', { method: 'GET' });
        profileImage = profile.profileImage;
        nickname = profile.nickname ?? '';
    } catch (error) {
        console.error(error);
    }

    const randomTagColor = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];

    const avatarContent = profileImage
        ? `<img src="${API_BASE_URL}${profileImage}" alt="" />`
        : nickname.charAt(0);

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
