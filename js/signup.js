const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const passwordCheckInput = document.querySelector('#password-check');
const nicknameInput = document.querySelector('#nickname');
const signupButton = document.querySelector('.primary-button');

function showHelperText(input, message) {
    const helperGroup = input.closest('.form-group');
    const signupHelperText = helperGroup.querySelector('.helper-text');

    signupHelperText.textContent = message;
    helperGroup.classList.add('is-error');
}

function clearHelperText(input) {
    const helperGroup = input.closest('.form-group');
    const signupHelperText = helperGroup.querySelector('.helper-text');

    signupHelperText.textContent = '';
    helperGroup.classList.remove('is-error');
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;

emailInput.addEventListener('blur', () => {
    const email = emailInput.value;

    clearHelperText(emailInput);

    // 이메일이 비어 있는 경우
    if (email === '') {
        showHelperText(emailInput, '* 이메일을 입력해주세요.');
        return;
    }

    // 이메일 값을 입력하지 않은 경우, 입력값이 유효하지 않은 경우
    if (!emailRegex.test(email)) {
        showHelperText(emailInput, '* 올바른 이메일 주소 형식을 입력해주세요. (예: example@adapterz.kr)');
        return;
    }

    // 중복된 이메일인 경우
});

passwordInput.addEventListener('blur', () => {
    const password = passwordInput.value;

    clearHelperText(passwordInput);

    // 비밀번호 입력 안 했을 시
    if (password === '') {
        showHelperText(passwordInput, '* 비밀번호를 입력해주세요.');
        return;
    }

    // 비밀번호 값이 유효하지 않은 경우
    if (!passwordRegex.test(password)) {
        showHelperText(passwordInput, '* 비밀번호는 8자 이상이며, 영문자, 숫자, 특수문자를 모두 포함해야 합니다.');
        return;
    }
});

passwordCheckInput.addEventListener('blur', () => {
    const password = passwordInput.value;
    const passwordCheck = passwordCheckInput.value;

    clearHelperText(passwordCheckInput);

    // 비밀번호 확인 입력 안 했을 시
    if (passwordCheck === '') {
        showHelperText(passwordCheckInput, '* 비밀번호를 한번 더 입력해주세요.');
        return;
    }

    // 비밀번호 확인 값이 유효하지 않은 경우
    if (!passwordRegex.test(passwordCheck)) {
        showHelperText(passwordCheckInput, '* 비밀번호는 8자 이상이며, 영문자, 숫자, 특수문자를 모두 포함해야 합니다.');
        return;
    }

    // 비밀번호가 확인과 다를시
    if (password !== passwordCheck) {
        showHelperText(passwordInput, '* 비밀번호가 다릅니다.');
        showHelperText(passwordCheckInput, '* 비밀번호가 다릅니다.');
        return;
    }
});

nicknameInput.addEventListener('blur', () => {
    const nickname = nicknameInput.value;

    clearHelperText(nicknameInput);

    // 닉네임 입력하지 않을 시
    if (nickname === '') {
        showHelperText(nicknameInput, '* 닉네임을 입력해주세요.');
        return;
    }

    // 닉네임에 띄어쓰기 있을 시
    if (nickname.includes(' ')) {
        showHelperText(nicknameInput, '* 띄어쓰기를 없애주세요.');
        return;
    }

    // 닉네임 중복 시

    // 닉네임 11자 이상 작성시
    if (nickname.length > 10) {
        showHelperText(nicknameInput, '* 닉네임은 최대 10자까지 작성 가능합니다.');
        return;
    }
});