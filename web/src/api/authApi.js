import { request } from './client.js';

// 로그인
export function login({ email, password }) {
    return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

// 회원가입
export function signup({ email, password, nickname, profileImage }) {
    return request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, nickname, profileImage }),
    });
}
