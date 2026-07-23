import { request } from './api.js';
import { showAlertModal, showLoginRequiredModal, isAuthError } from './modal.js';

const currentPasswordInput = document.querySelector('#current-password');
const passwordInput = document.querySelector('#password');
const passwordCheckInput = document.querySelector('#password-check');
const passwordSubmitButton = document.querySelector('.primary-button');
const editPasswordCompleteToast = document.querySelector('.edit-password-complete-toast');

const currentPasswordGroup = currentPasswordInput.closest('.form-group');
const passwordGroup = passwordInput.closest('.form-group');
const passwordCheckGroup = passwordCheckInput.closest('.form-group');
const currentPasswordHelperText = currentPasswordGroup.querySelector('.helper-text');
const passwordHelperText = passwordGroup.querySelector('.helper-text');
const passwordCheckHelperText = passwordCheckGroup.querySelector('.helper-text');

passwordSubmitButton.disabled = true;

function isValidPassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;
    return passwordRegex.test(password);
}

function validatePasswordForm() {
    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = passwordInput.value.trim();
    const newPasswordCheck = passwordCheckInput.value.trim();

    currentPasswordGroup.classList.remove('is-error');
    passwordGroup.classList.remove('is-error');
    passwordCheckGroup.classList.remove('is-error');

    currentPasswordHelperText.textContent = '';
    passwordHelperText.textContent = '';
    passwordCheckHelperText.textContent = '';

    let isValid = true;

    if (currentPassword === '') {
        currentPasswordGroup.classList.add('is-error');
        currentPasswordHelperText.textContent = '* 현재 비밀번호를 입력해주세요.';
        isValid = false;
    }

    if (newPassword === '') {
        passwordGroup.classList.add('is-error');
        passwordHelperText.textContent = '* 새 비밀번호를 입력해주세요.';
        isValid = false;
    } else if (!isValidPassword(newPassword)) {
        passwordGroup.classList.add('is-error');
        passwordHelperText.textContent = '* 비밀번호는 8자 이상, 20자 이하이며 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
        isValid = false;
    }

    if (newPasswordCheck === '') {
        passwordCheckGroup.classList.add('is-error');
        passwordCheckHelperText.textContent = '* 새 비밀번호를 한번 더 입력해주세요.';
        isValid = false;
    } else if (newPassword !== newPasswordCheck) {
        passwordCheckGroup.classList.add('is-error');
        passwordCheckHelperText.textContent = '* 비밀번호와 다릅니다.';
        isValid = false;
    }

    passwordSubmitButton.disabled = !isValid;

    return isValid;
}

currentPasswordInput.addEventListener('input', validatePasswordForm);
passwordInput.addEventListener('input', validatePasswordForm);
passwordCheckInput.addEventListener('input', validatePasswordForm);

passwordSubmitButton.addEventListener('click', async () => {
    const isValid = validatePasswordForm();

    if (!isValid) {
        return;
    }

    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = passwordInput.value.trim();

    try {
        await request('/user/password', {
            method: 'PATCH',
            body: JSON.stringify({
                password: currentPassword,
                newPassword: newPassword,
            }),
        });

        currentPasswordInput.value = '';
        passwordInput.value = '';
        passwordCheckInput.value = '';
        passwordSubmitButton.disabled = true;

        // 수정 완료 토스트
        editPasswordCompleteToast.classList.add('is-show');
    
        setTimeout(() => {
            editPasswordCompleteToast.classList.remove('is-show');
        }, 1500);

    } catch (error) {
        if (error.body?.message === 'password_mismatch') {
            currentPasswordGroup.classList.add('is-error');
            currentPasswordHelperText.textContent = '* 현재 비밀번호가 일치하지 않습니다.';
            return;
        }

        if (isAuthError(error)) {
            await showLoginRequiredModal();
            return;
        }

        await showAlertModal({ message: '비밀번호 수정에 실패했습니다.' });
        console.error(error);
    }
});