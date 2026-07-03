const commentList = document.querySelector('.comment-list');
const commentTextarea = document.querySelector('.comment-form textarea');
const commentSubmitButton = document.querySelector('.comment-submit');

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

    try {
        const response = await fetch(`http://localhost:8080/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-USER-ID': userId,
            },
    
            body: JSON.stringify({
                content: commentContent,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            alert('댓글 작성에 실패했습니다.');
            return;
        }

        console.log('댓글 작성 응답:', data);

        commentTextarea.value = '';
        updateCommentSubmitButtonState();

    } catch (error) {
        console.error(error);
    }

    // 댓글 작성 후에 댓글 목록 갱신
    fetchPostDetail();
})

// 댓글 수정 클릭하면 textarea에 댓글 내용이 들어가고, 댓글 등록 버튼이 댓글 수정 버튼으로 바뀌도록 구현
// 댓글 수정 버튼 클릭 시 댓글 수정 API 호출
// 댓글 삭제 시 확인모달 띄우기 -> 확인 클릭 시 댓글 삭제 API 호출

function renderComments(comments) {
    if (comments.length === 0) {
        commentList.innerHTML = '<p>댓글이 없습니다.</p>';
        return;
    }

    commentList.innerHTML = comments.map((comment) => {
        const isMyComment = Number(userId) === comment.writer.userId;

        return `
            <article class="comment-item">
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

                <p>${comment.content}</p>
            </article>
        `;
    }).join('');
}