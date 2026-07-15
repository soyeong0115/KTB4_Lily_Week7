import { request } from './api.js';

const emailText = document.querySelector('#email');
const nicknameInput = document.querySelector('#nickname');

const helperText = document.querySelector('.profile-helper-text');

const profileSubmitButton = document.querySelector('.profile-submit-button');
const profileWithdrawButton = document.querySelector('.profile-withdraw-button');
const profileCompleteToast = document.querySelector('.profile-complete-toast');

const accessToken = localStorage.getItem('accessToken');

let originalNickname = ''; // 기존 닉네임 저장하고 시작

async function fetchMyProfile() {
    if (!accessToken) {
        alert('로그인이 필요합니다.');
        window.location.href = './index.html';
    } 

    try {
        const profile = await request('/user/profile', { method: 'GET' });

        console.log('프로필 조회 응답:', profile);

        emailText.textContent = profile.email;
        nicknameInput.value = profile.nickname;

        originalNickname = profile.nickname;

    } catch (error) {
        alert('회원정보를 불러오지 못했습니다.');
        console.error(error);
    }
}

fetchMyProfile();

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

        console.error(error);
    }
});

profileWithdrawButton.addEventListener('click', async () => {
    // 회원 탈퇴 모달 UI 구현 후 교체 예정
    const confirmDelete = confirm("회원탈퇴 하시겠습니까?");

    if (!confirmDelete) {
        return;
    }

    try {
        await request('/user', { method: 'DELETE' });

        localStorage.removeItem('accessToken');
        window.location.href = './index.html';

    } catch (error) {
        alert('회원 탈퇴에 실패했습니다.');
        console.error(error);
    }
});