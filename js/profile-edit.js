import { request, API_BASE_URL } from './api.js';
import { showConfirmModal, showAlertModal, showLoginRequiredModal, isAuthError } from './modal.js';

const emailText = document.querySelector('#email');
const nicknameInput = document.querySelector('#nickname');
const profileImageInput = document.querySelector('#profileImageInput');
const profileImagePreview = document.querySelector('.profile-edit-photo');

const helperText = document.querySelector('.profile-helper-text');

const profileSubmitButton = document.querySelector('.profile-submit-button');
const profileWithdrawButton = document.querySelector('.profile-withdraw-button');
const profileCompleteToast = document.querySelector('.profile-complete-toast');

const accessToken = localStorage.getItem('accessToken');

let originalNickname = ''; // 기존 닉네임 저장하고 시작

let profileImageUrl = null;

// 프로필 이미지 미리보기
function showProfileImagePreview(imageUrl) {
    let previewImage = profileImagePreview.querySelector('img');

    // 함수가 <img> 태그를 동적으로 생성해 넣는 방식
    if (!previewImage) {
        previewImage = document.createElement('img');
        profileImagePreview.prepend(previewImage);
    }

    previewImage.src = `${API_BASE_URL}${imageUrl}`;
}

async function fetchMyProfile() {
    if (!accessToken) {
        await showLoginRequiredModal();
        return;
    }

    try {
        const profile = await request('/user/profile', { method: 'GET' });

        console.log('프로필 조회 응답:', profile);

        emailText.textContent = profile.email;
        nicknameInput.value = profile.nickname;

        originalNickname = profile.nickname;

        if (profile.profileImage) {
            profileImageUrl = profile.profileImage;
            showProfileImagePreview(profile.profileImage);
        }

    } catch (error) {
        if (isAuthError(error)) {
            await showLoginRequiredModal();
            return;
        }

        await showAlertModal({ message: '회원정보를 불러오지 못했습니다.' });
        console.error(error);
    }
}

fetchMyProfile();

// 이미지 업로드
profileImageInput.addEventListener('click', async () => {
    const file = profileImageInput.files[0];

    if (!file) {
        return;
    }

    try {
        const formDate = new FormData();
        formDate.append('image', file);

        const response = await request('/images', {
            method: 'POST',
            body: formDate,
        });

        profileImageUrl = response.imageUrl;
        showProfileImagePreview(response.imageUrl);

    } catch(error) {
        if (isAuthError(error)) {
            await showLoginRequiredModal();
            return;
        }

        await showAlertModal({ message: '이미지 업로드에 실패했습니다.' });
        console.error(error);
    }
});

profileSubmitButton.addEventListener('click', async () => {
    const nickname = nicknameInput.value.trim();

    // 닉네임 입력하지 않을 시
    if (nickname == '') {
        helperText.textContent = '* 닉네임을 입력해주세요.';
        return;
    }

    // 닉네임 11자 이상 작성 시
    if (nickname.length > 10) {
        helperText.textContent = '* 닉네임은 최대 10자 까지 작성 가능합니다.';
        return;
    }

    try {
        await request('/user/profile', {
            method: 'PATCH',
            body: JSON.stringify({
                nickname: nickname,
                profileImage: profileImageUrl,
            })
        });

        helperText.textContent = '';
        originalNickname = nickname;

        // 수정 완료 토스트
        profileCompleteToast.classList.add('is-show');

        setTimeout(() => {
            profileCompleteToast.classList.remove('is-show');
        }, 1500);

    } catch (error) {
        // 닉네임 중복 시
        if (error.body?.message === 'nickname_duplicated') {
            helperText.textContent = '* 중복된 닉네임입니다.';
            return;
        }

        if (isAuthError(error)) {
            await showLoginRequiredModal();
            return;
        }

        await showAlertModal({ message: '회원정보 수정에 실패했습니다.' });
        console.error(error);
    }
});

profileWithdrawButton.addEventListener('click', async () => {
    const confirmDelete = await showConfirmModal({
        title: '회원탈퇴 하시겠습니까?',
        message: '작성된 게시글과 댓글은 삭제됩니다.',
    });

    if (!confirmDelete) {
        return;
    }

    try {
        await request('/user', { method: 'DELETE' });

        localStorage.removeItem('accessToken');
        window.location.href = './index.html';

    } catch (error) {
        if (isAuthError(error)) {
            await showLoginRequiredModal();
            return;
        }

        await showAlertModal({ message: '회원탈퇴에 실패했습니다.' });
        console.error(error);
    }
});