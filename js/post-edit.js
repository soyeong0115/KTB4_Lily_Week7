import { request } from './api.js';

const postId = new URLSearchParams(window.location.search).get('postId');

const backButton = document.querySelector('.back-button');

const postTitleInput = document.querySelector('#title');
const postContentInput = document.querySelector('#content');
const postEditButton = document.querySelector('.post-submit-button');

const helperText = document.querySelector('.helper-text');

postEditButton.disabled = true;

// 뒤로가기 버튼
backButton.href = `./post-detail.html?postId=${postId}`;

fetchPostEdit();

async function fetchPostEdit() {
    try {
        const post = await request(`/posts/${postId}`, { method: 'GET' });

        postTitleInput.value = post.title;
        postContentInput.value = post.content;

        updatePostEditButtonState();

    } catch (error) {
        alert('게시글 정보를 불러오지 못했습니다.');
        console.error(error);
    }
}

function updatePostEditButtonState() {
    const title = postTitleInput.value.trim();
    const content = postContentInput.value.trim();

    postEditButton.disabled = !(title !== '' && content !== '');
}

postTitleInput.addEventListener('input', updatePostEditButtonState);
postContentInput.addEventListener('input', updatePostEditButtonState);

postEditButton.addEventListener('click', async () => {
    const title = postTitleInput.value.trim();
    const content = postContentInput.value.trim();

    if (title === '' || content === '') {
        helperText.textContent = '* 제목과 내용을 모두 입력해주세요.';
        return;
    }

    try {
        await request(`/posts/${postId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                title: title,
                content: content,
            }),
        });

        window.location.href = `./post-detail.html?postId=${postId}`;

    } catch (error) {
        alert('게시글 수정에 실패했습니다.');
        console.error(error);
    }
});