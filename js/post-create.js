const postTitleInput = document.querySelector('#title');
const postContentInput = document.querySelector('#content');
const fileButton = document.querySelector('.file-button');
const postSubmitButton = document.querySelector('.post-submit-button');

const helperGroup = document.querySelector('.post-form-group');
const postCreateHelperText = helperGroup.querySelector('.helper-text');

if (postTitleInput.value.trim() !== '' && postContentInput.value.trim() !== '') {
    postSubmitButton.disabled = false;
} else {
    postSubmitButton.disabled = true;
}

// 파일 선택 버튼 클릭 이벤트 => 컴퓨터에서 이미지 파일 업로드

postSubmitButton.addEventListener('click', () => {
    const postTitle = postTitleInput.value;
    const postContent = postContentInput.value;

    postCreateHelperText.textContent = ''; // 초기화
    helperGroup.classList.remove('is-error'); // 초기화

    if (postTitle.trim() === '' || postContent.trim() === '') {
        postCreateHelperText.textContent = '* 제목, 내용을 모두 작성해주세요.';
        helperGroup.classList.add('is-error');
        return;
    }
    
    // 게시물 추가 API 호출
});