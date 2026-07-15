import { request } from './api.js';
import { fetchPostDetail } from './post-detail.js';

const commentList = document.querySelector('.comment-list');
const commentTextarea = document.querySelector('.comment-form textarea');
const commentSubmitButton = document.querySelector('.comment-submit');
const commentEditButton = document.querySelector('.comment-edit-button');
const commentDeleteButton = document.querySelector('.comment-delete-button');

const commentPostId = new URLSearchParams(window.location.search).get('postId');
const accessToken = localStorage.getItem('accessToken');

let currentUserId = null;
let editingCommentId = null;

async function fetchCurrentUser() {
    if (!accessToken) {
        return;
    }

    const profile = await request('/user/profile', { method: 'GET' });

    currentUserId = profile.userId;
}

console.log('현재 주소:', window.location.href);
console.log('commentPostId:', commentPostId);

commentSubmitButton.disabled = true;

function updateCommentSubmitButtonState() {
    const commentContent = commentTextarea.value.trim();
    commentSubmitButton.disabled = commentContent === '';
}

commentTextarea.addEventListener('input', () => {
    updateCommentSubmitButtonState();
});

commentSubmitButton.addEventListener('click', async () => {
    const commentContent = commentTextarea.value.trim();
    const isEditing = editingCommentId !== null;

    const url = isEditing
        ? `/posts/${commentPostId}/comments/${editingCommentId}`
        : `/posts/${commentPostId}/comments`;

    const method = isEditing ? 'PATCH' : 'POST';

    try {
        await request(url, {
            method: method,
            body: JSON.stringify({
                content: commentContent,
            }),
        });

        commentTextarea.value = '';
        commentSubmitButton.textContent = '댓글 등록';
        editingCommentId = null;

        updateCommentSubmitButtonState();

    } catch (error) {
        console.error(error);
    }

    // 댓글 작성 후에 댓글 목록 갱신
    fetchPostDetail();
})

commentList.addEventListener('click', async (event) => {
    const commentItem = event.target.closest('.comment-item');

    if (!commentItem) {
        return;
    }

    const commentId = commentItem.dataset.commentId;

    if (event.target.classList.contains('comment-edit-button')) {
        const commentContent = commentItem.querySelector('.comment-content').textContent;

        commentTextarea.value = commentContent;
        commentSubmitButton.textContent = '댓글 수정';
        editingCommentId = commentId;

        updateCommentSubmitButtonState();
        commentTextarea.focus();

        return;
    }

    if (event.target.classList.contains('comment-delete-button')) {
        // 삭제 확인 모달 UI로 교체 예정
        const confirmDelete = confirm('정말로 댓글을 삭제하시겠습니까?');

        if (!confirmDelete) {
            return;
        }

        try {
            await request(`/posts/${commentPostId}/comments/${commentId}`, {
                method: 'DELETE',
            });

            fetchPostDetail();

        } catch (error) {
            console.error(error);
        }
    }
});


export function renderComments(comments) {
    if (comments.length === 0) {
        commentList.innerHTML = '<p>댓글이 없습니다.</p>';
        return;
    }

    commentList.innerHTML = comments.map((comment) => {
        const isMyComment = currentUserId === comment.writer.userId;

        return `
            <article class="comment-item" data-comment-id="${comment.commentId}">
                <div class="comment-item-top">
                    <div class="comment-info">
                        <strong>${comment.writer.nickname}</strong>
                        <time>${comment.createdAt}</time>
                    </div>

                    ${
                        isMyComment
                            ? `
                                <div class="small-button-group comment-button-group">
                                    <button class="small-button comment-edit-button" type="button" data-comment-id="${comment.commentId}">
                                        수정
                                    </button>
                                    <button class="small-button comment-delete-button" type="button" data-comment-id="${comment.commentId}">
                                        삭제
                                    </button>
                                </div>
                            `
                            : ''
                    }
                </div>

                <p class="comment-content">${comment.content}</p>
            </article>
        `;
    }).join('');
}