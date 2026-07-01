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

const validationState = {
    email: false,
    password: false,
    passwordCheck: false,
    nickname: false
};

function updateSignupButtonState() {
    signupButton.disabled = !(
        validationState.email &&
        validationState.password &&
        validationState.passwordCheck &&
        validationState.nickname
    );
}

emailInput.addEventListener('blur', () => {
    const email = emailInput.value;

    clearHelperText(emailInput);
    validationState.email = false;

    // 이메일이 비어 있는 경우
    if (email === '') {
        showHelperText(emailInput, '* 이메일을 입력해주세요.');
        updateSignupButtonState();
        return;
    }

    // 이메일 값을 입력하지 않은 경우, 입력값이 유효하지 않은 경우
    if (!emailRegex.test(email)) {
        showHelperText(emailInput, '* 올바른 이메일 주소 형식을 입력해주세요. (예: example@adapterz.kr)');
        updateSignupButtonState();
        return;
    }

    validationState.email = true;
    updateSignupButtonState();
});

passwordInput.addEventListener('blur', () => {
    const password = passwordInput.value;

    clearHelperText(passwordInput);
    validationState.password = false;

    // 비밀번호 입력 안 했을 시
    if (password === '') {
        showHelperText(passwordInput, '* 비밀번호를 입력해주세요.');
        updateSignupButtonState();
        return;
    }

    // 비밀번호 값이 유효하지 않은 경우
    if (!passwordRegex.test(password)) {
        showHelperText(passwordInput, '* 비밀번호는 8자 이상이며, 영문자, 숫자, 특수문자를 모두 포함해야 합니다.');
        updateSignupButtonState();
        return;
    }

    validationState.password = true;
    updateSignupButtonState();
});

passwordCheckInput.addEventListener('blur', () => {
    const password = passwordInput.value;
    const passwordCheck = passwordCheckInput.value;

    clearHelperText(passwordCheckInput);
    validationState.passwordCheck = false;

    // 비밀번호 확인 입력 안 했을 시
    if (passwordCheck === '') {
        showHelperText(passwordCheckInput, '* 비밀번호를 한번 더 입력해주세요.');
        updateSignupButtonState();
        return;
    }

    // 비밀번호 확인 값이 유효하지 않은 경우
    if (!passwordRegex.test(passwordCheck)) {
        showHelperText(passwordCheckInput, '* 비밀번호는 8자 이상이며, 영문자, 숫자, 특수문자를 모두 포함해야 합니다.');
        updateSignupButtonState();
        return;
    }

    // 비밀번호가 확인과 다를시
    if (password !== passwordCheck) {
        showHelperText(passwordInput, '* 비밀번호가 다릅니다.');
        showHelperText(passwordCheckInput, '* 비밀번호가 다릅니다.');
        updateSignupButtonState();
        return;
    }

    validationState.passwordCheck = true;
    updateSignupButtonState();
});

nicknameInput.addEventListener('blur', () => {
    const nickname = nicknameInput.value;

    clearHelperText(nicknameInput);
    validationState.nickname = false;

    // 닉네임 입력하지 않을 시
    if (nickname === '') {
        showHelperText(nicknameInput, '* 닉네임을 입력해주세요.');
        updateSignupButtonState();
        return;
    }

    // 닉네임에 띄어쓰기 있을 시
    if (nickname.includes(' ')) {
        showHelperText(nicknameInput, '* 띄어쓰기를 없애주세요.');
        updateSignupButtonState();
        return;
    }

    // 닉네임 중복 시

    // 닉네임 11자 이상 작성시
    if (nickname.length > 10) {
        showHelperText(nicknameInput, '* 닉네임은 최대 10자까지 작성 가능합니다.');
        updateSignupButtonState();
        return;
    }

    validationState.nickname = true;
    updateSignupButtonState();
});

signupButton.addEventListener('click', async() => {
    const email = emailInput.value;
    const password = passwordInput.value;
    const nickname = nicknameInput.value;

    try {
        const response = await fetch('http://localhost:8080/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
                nickname: nickname
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            // 중복된 이메일인 경우
            if (data.message === 'email_duplicated') {
                showHelperText(emailInput, '* 중복된 이메일 입니다.');
                return;
            }

            // 중복된 닉네임인 경우
            if (data.message === 'nickname_duplicated') {
                showHelperText(nicknameInput, '* 중복된 닉네임 입니다.');
                return;
            }
        }

        window.location.href = './index.html';
    } catch (error) {
        console.error(error);
    }
});