import { request } from './client.js';

// 댓글 작성
export function createComment(postId, content) {
    return request(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    });
}

// 댓글 수정
export function updateComment(postId, commentId, content) {
    return request(`/posts/${postId}/comments/${commentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content }),
    });
}

// 댓글 삭제
export function deleteComment(postId, commentId) {
    return request(`/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
    });
}
