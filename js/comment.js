import { request } from './api.js';
import { fetchPostDetail } from './post-detail.js';
import { showConfirmModal, showAlertModal } from './modal.js';

const commentList = document.querySelector('.comment-list');
const commentTextarea = document.querySelector('.comment-form textarea');
const commentSubmitButton = document.querySelector('.comment-submit');
const commentEditButton = document.querySelector('.comment-edit-button');
const commentDeleteButton = document.querySelector('.comment-delete-button');

const commentPostId = new URLSearchParams(window.location.search).get('postId');

let editingCommentId = null;

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

    commentSubmitButton.disabled = true;

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

        // 댓글 작성/수정 후에 댓글 목록 갱신
        fetchPostDetail();
    } catch (error) {
        await showAlertModal({ message: '댓글 등록에 실패했습니다.' });
        console.error(error);
    } finally {
        updateCommentSubmitButtonState();
    }
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
        const confirmDelete = await showConfirmModal({
            title: '댓글을 삭제하시겠습니까?',
            message: '삭제한 내용은 복구 할 수 없습니다.',
        });

        if (!confirmDelete) {
            return;
        }

        try {
            await request(`/posts/${commentPostId}/comments/${commentId}`, {
                method: 'DELETE',
            });

            fetchPostDetail();

        } catch (error) {
            await showAlertModal({ message: '댓글 삭제에 실패했습니다.' });
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
        const isMyComment = comment.myComment;

        return `
            <article class="comment-item" data-comment-id="${comment.commentId}">
                <div class="comment-item-top" data-initial="${comment.writer.nickname.charAt(0)}">
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