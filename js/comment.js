const commentList = document.querySelector('.comment-list');
const commentTextarea = document.querySelector('.comment-form textarea');
const commentSubmitButton = document.querySelector('.comment-submit');
const commentEditButton = document.querySelector('.comment-edit-button');
const commentDeleteButton = document.querySelector('.comment-delete-button');

const commentPostId = new URLSearchParams(window.location.search).get('postId');
const commentUserId = localStorage.getItem('userId');

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

let editingCommentId = null;

commentSubmitButton.addEventListener('click', async () => {
    const commentContent = commentTextarea.value.trim();
    const isEditing = editingCommentId !== null;

    const url = isEditing
        ? `http://localhost:8080/posts/${commentPostId}/comments/${editingCommentId}`
        : `http://localhost:8080/posts/${commentPostId}/comments`;

    const method = isEditing ? 'PATCH' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-USER-ID': commentUserId,
            },
    
            body: JSON.stringify({
                content: commentContent,
            }),
        });

        const data = await response.json();

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
            const response = await fetch(`http://localhost:8080/posts/${commentPostId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-USER-ID': commentUserId,
                },
            });

            fetchPostDetail();

        } catch (error) {
            console.error(error);
        }
    }
});


function renderComments(comments) {
    if (comments.length === 0) {
        commentList.innerHTML = '<p>댓글이 없습니다.</p>';
        return;
    }

    commentList.innerHTML = comments.map((comment) => {
        const isMyComment = Number(userId) === comment.writer.userId;

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