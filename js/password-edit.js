const passwordInput = document.querySelector('#password');
const passwordCheckInput = document.querySelector('#password-check');
const passwordSubmitButton = document.querySelector('.primary-button');
const editPasswordCompleteToast = document.querySelector('.edit-password-complete-toast');

const passwordGroup = passwordInput.closest('.form-group');
const passwordCheckGroup = passwordCheckInput.closest('.form-group');
const passwordHelperText = passwordGroup.querySelector('.helper-text');
const passwordCheckHelperText = passwordCheckGroup.querySelector('.helper-text');

const accessToken = localStorage.getItem('accessToken');

passwordSubmitButton.disabled = true;

function isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,20}$/;
    return passwordRegex.test(password);
}

function validatePasswordForm() {
    const password = passwordInput.value.trim();
    const newPassword = passwordCheckInput.value.trim();

    passwordGroup.classList.remove('is-error');
    passwordCheckGroup.classList.remove('is-error');

    passwordHelperText.textContent = '';
    passwordCheckHelperText.textContent = '';

    let isValid = true;

    if (password === '') {
        passwordGroup.classList.add('is-error');
        passwordHelperText.textContent = '* 비밀번호를 입력해주세요.';
        isValid = false;
    } else if (!isValidPassword(password)) {
        passwordGroup.classList.add('is-error');
        passwordHelperText.textContent = '* 비밀번호는 8자 이상, 20자 이하이며 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
        isValid = false;
    }

    if (newPassword === '') {
        passwordCheckGroup.classList.add('is-error');
        passwordCheckHelperText.textContent = '* 비밀번호를 한번 더 입력해주세요.';
        isValid = false;
    } else if (password !== newPassword) {
        passwordCheckGroup.classList.add('is-error');
        passwordCheckHelperText.textContent = '* 비밀번호와 다릅니다.';
        isValid = false;
    }

    passwordSubmitButton.disabled = !isValid;

    return isValid;
}

passwordInput.addEventListener('input', validatePasswordForm);
passwordCheckInput.addEventListener('input', validatePasswordForm);

passwordSubmitButton.addEventListener('click', async () => {
    const isValid = validatePasswordForm();

    if (!isValid) {
        return;
    }

    const password = passwordInput.value.trim();
    const newPassword = passwordCheckInput.value.trim();

    try {
        const response = await fetch('http://localhost:8080/user/password', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                password: password,
                newPassword: newPassword,
            }),
        });

        passwordInput.value = '';
        passwordCheckInput.value = '';
        passwordSubmitButton.disabled = true;

        console.log('프로필 수정 성공 여부', response.ok);

        // 수정 완료 토스트
        editPasswordCompleteToast.classList.add('is-show');
    
        setTimeout(() => {
            editPasswordCompleteToast.classList.remove('is-show');
        }, 1500);

    } catch (error) {
        console.error(error);
    }
});