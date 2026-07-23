import { request } from './api.js';
import { showAlertModal, showLoginRequiredModal, isAuthError } from './modal.js';

const postId = new URLSearchParams(window.location.search).get('postId');

const backButton = document.querySelector('.back-button');

const postTitleInput = document.querySelector('#title');
const postContentInput = document.querySelector('#content');
const postEditButton = document.querySelector('.post-submit-button');
const fileButton = document.querySelector('.file-button');
const postImageInput = document.querySelector('#postImageInput');
const fileNameText = document.querySelector('.file-row span');

const helperText = document.querySelector('.helper-text');

postEditButton.disabled = true;

let postImageUrl = null;

// 뒤로가기 버튼
backButton.href = `./post-detail.html?postId=${postId}`;

fetchPostEdit();

async function fetchPostEdit() {
    try {
        const post = await request(`/posts/${postId}`, { method: 'GET' });

        postTitleInput.value = post.title;
        postContentInput.value = post.content;

        if (post.postImage) {
            postImageUrl = post.postImage;
            fileNameText.textContent = post.postImage.split('/').pop();
        }

        updatePostEditButtonState();

    } catch (error) {
        await showAlertModal({ message: '게시글 정보를 불러오지 못했습니다.' });
        console.error(error);
    }
}

fileButton.addEventListener('click', () => {
    postImageInput.click();
});

postImageInput.addEventListener('change', async () => {
    const file = postImageInput.files[0];

    if (!file) {
        return;
    }

    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await request('/images', {
            method: 'POST',
            body: formData,
        });

        postImageUrl = response.imageUrl;
        fileNameText.textContent = file.name;

    } catch (error) {
        if (isAuthError(error)) {
            await showLoginRequiredModal();
            return;
        }

        await showAlertModal({ message: '이미지 업로드에 실패했습니다.' });
        console.error(error);
    }
});

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
                postImage: postImageUrl,
            }),
        });

        window.location.href = `./post-detail.html?postId=${postId}`;

    } catch (error) {
        if (isAuthError(error)) {
            await showLoginRequiredModal();
            return;
        }

        await showAlertModal({ message: '게시글 수정에 실패했습니다.' });
        console.error(error);
    }
});