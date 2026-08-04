import { request } from './client.js';

export function getPosts({ page, size }) {
    return request(`/posts?page=${page}&size=${size}`, { method: 'GET' });
}

export function getPopularPosts(limit = 5) {
    return request(`/posts/popular?limit=${limit}`, { method: 'GET' });
}

export function getPost(postId, { countView = true } = {}) {
    const countParam = countView ? '' : '?countView=false';
    return request(`/posts/${postId}${countParam}`, { method: 'GET' });
}

export function createPost({ title, content, postImage }) {
    return request('/posts', {
        method: 'POST',
        body: JSON.stringify({ title, content, postImage }),
    });
}

export function updatePost(postId, { title, content, postImage }) {
    return request(`/posts/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title, content, postImage }),
    });
}

export function deletePost(postId) {
    return request(`/posts/${postId}`, { method: 'DELETE' });
}

export function likePost(postId) {
    return request(`/posts/${postId}/likes`, { method: 'POST' });
}

export function unlikePost(postId) {
    return request(`/posts/${postId}/likes`, { method: 'DELETE' });
}
