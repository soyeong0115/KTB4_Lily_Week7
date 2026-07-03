const postId = new URLSearchParams(window.location.search).get('postId');
const userId = localStorage.getItem('userId');

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
        const response = await fetch(`http://localhost:8080/posts/${postId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-USER-ID': userId,
            },
        });

        const data = await response.json();
        const post = data.data;

        postTitleInput.value = post.title;
        postContentInput.value = post.content;

        updatePostEditButtonState();

    } catch (error) {
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
        const response = await fetch(`http://localhost:8080/posts/${postId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-USER-ID': userId,
            },
            body: JSON.stringify({
                title: title,
                content: content,
            }),
        });

        if (!response.ok) {
            alert('게시글 수정에 실패했습니다.');
            return;
        }

        window.location.href = `./post-detail.html?postId=${postId}`;

    } catch (error) {
        console.error(error);
    }
});