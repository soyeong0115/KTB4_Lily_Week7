import { request } from './client.js';

export function createComment(postId, content) {
    return request(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    });
}

export function updateComment(postId, commentId, content) {
    return request(`/posts/${postId}/comments/${commentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content }),
    });
}

export function deleteComment(postId, commentId) {
    return request(`/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
    });
}
