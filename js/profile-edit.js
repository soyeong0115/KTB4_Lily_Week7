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
        const response = await fetch('http://localhost:8080/user/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        console.log('프로필 조회 응답:', data);

        if (!response.ok) {
            alert('회원정보를 불러오지 못했습니다.');
            return;
        }

        const profile = data.data;

        emailText.textContent = profile.email;
        nicknameInput.value = profile.nickname;

        originalNickname = profile.nickname;

    } catch (error) {
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
        const response = await fetch(`http://localhost:8080/user/profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                nickname: nickname,
            })
        });

        const data = await response.json();
            
        // 닉네임 중복 시
        if (!response.ok) {
            if (data.message === 'nickname_duplicated') {
                helperText.textContent = '* 중복된 닉네임입니다.';
                return;
            }
        }
        
        helperText.textContent = '';
        originalNickname = nickname;

        console.log('프로필 수정 성공 여부', response.ok);

        // 수정 완료 토스트
        profileCompleteToast.classList.add('is-show');
    
        setTimeout(() => {
            profileCompleteToast.classList.remove('is-show');
        }, 1500);

    } catch (error) {
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
        const response = await fetch('http://localhost:8080/user', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            alert('회원 탈퇴에 실패했습니다.');
            return;
        }

        localStorage.removeItem('accessToken');
        window.location.href = './index.html';

    } catch (error) {
        console.error(error);
    }
});