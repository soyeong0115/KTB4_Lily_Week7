import { request } from './api.js';

const postTitleInput = document.querySelector('#title');
const postContentInput = document.querySelector('#content');
const fileButton = document.querySelector('.file-button');
const postSubmitButton = document.querySelector('.post-submit-button');

const helperGroup = postContentInput.closest('.post-form-group');
const postCreateHelperText = helperGroup.querySelector('.helper-text');

const validationState = {
    postTitle: false,
    postContent: false,
};

function updatePostSubmitButtonState() {
    postSubmitButton.disabled = !(
        validationState.postTitle &&
        validationState.postContent
    );
}

postTitleInput.addEventListener('blur', () => {
    validationState.postTitle = postTitleInput.value.trim() !== '';
    updatePostSubmitButtonState();
});

postContentInput.addEventListener('blur', () => {
    validationState.postContent = postContentInput.value.trim() !== '';
    updatePostSubmitButtonState();
});

// 파일 선택 버튼 클릭 이벤트 => 컴퓨터에서 이미지 파일 업로드

postSubmitButton.addEventListener('click', async() => {
    const postTitle = postTitleInput.value;
    const postContent = postContentInput.value;

    postCreateHelperText.textContent = ''; // 초기화
    helperGroup.classList.remove('is-error'); // 초기화

    // 버튼 클릭시 제목, 내용이 작성되어 있지 않을 경우
    if (postTitle.trim() === '' || postContent.trim() === '') {
        postCreateHelperText.textContent = '* 제목, 내용을 모두 작성해주세요.';
        helperGroup.classList.add('is-error');
        return;
    }

    postSubmitButton.disabled = true;

    try {
        await request('/posts', {
            method: 'POST',
            body: JSON.stringify({
                title: postTitle,
                content: postContent,
            }),
        });

        window.location.href = './posts.html';
    } catch (error) {
        postCreateHelperText.textContent = '* 게시글 작성에 실패했습니다.';
        helperGroup.classList.add('is-error');
        console.error(error);
        updatePostSubmitButtonState();
    }
});