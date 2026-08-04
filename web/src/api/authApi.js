import { request } from './client.js';

export function login({ email, password }) {
    return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export function signup({ email, password, nickname, profileImage }) {
    return request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, nickname, profileImage }),
    });
}
