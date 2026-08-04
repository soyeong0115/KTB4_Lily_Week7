import { request } from './client.js';

export function getProfile() {
    return request('/user/profile', { method: 'GET' });
}

export function updateProfile({ nickname, profileImage }) {
    return request('/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ nickname, profileImage }),
    });
}

export function updatePassword({ password, newPassword }) {
    return request('/user/password', {
        method: 'PATCH',
        body: JSON.stringify({ password, newPassword }),
    });
}

export function deleteUser() {
    return request('/user', { method: 'DELETE' });
}
