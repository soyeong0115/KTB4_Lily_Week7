import { request } from './client.js';

// 게시글 목록 조회
export function getPosts({ page, size }) {
    return request(`/posts?page=${page}&size=${size}`, { method: 'GET' });
}

// 인기글 상위 N개 조회
export function getPopularPosts(limit = 5) {
    return request(`/posts/popular?limit=${limit}`, { method: 'GET' });
}

// 게시글 상세 조회
export function getPost(postId, { countView = true } = {}) {
    const countParam = countView ? '' : '?countView=false';
    return request(`/posts/${postId}${countParam}`, { method: 'GET' });
}

// 게시글 작성
export function createPost({ title, content, postImage }) {
    return request('/posts', {
        method: 'POST',
        body: JSON.stringify({ title, content, postImage }),
    });
}

// 게시글 수정
export function updatePost(postId, { title, content, postImage }) {
    return request(`/posts/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title, content, postImage }),
    });
}

// 게시글 삭제
export function deletePost(postId) {
    return request(`/posts/${postId}`, { method: 'DELETE' });
}

// 좋아요 등록
export function likePost(postId) {
    return request(`/posts/${postId}/likes`, { method: 'POST' });
}

// 좋아요 취소
export function unlikePost(postId) {
    return request(`/posts/${postId}/likes`, { method: 'DELETE' });
}
