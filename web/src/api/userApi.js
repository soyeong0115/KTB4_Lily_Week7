import { request } from './client.js';

// 내 프로필 조회
export function getProfile() {
    return request('/user/profile', { method: 'GET' });
}

// 프로필 수정
export function updateProfile({ nickname, profileImage }) {
    return request('/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ nickname, profileImage }),
    });
}

// 비밀번호 변경
export function updatePassword({ password, newPassword }) {
    return request('/user/password', {
        method: 'PATCH',
        body: JSON.stringify({ password, newPassword }),
    });
}

// 회원 탈퇴
export function deleteUser() {
    return request('/user', { method: 'DELETE' });
}
