const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const loginButton = document.querySelector('#login-button');

const emailHelperGroup = emailInput.closest('.form-group');
const emailHelperText = emailHelperGroup.querySelector('.helper-text');

const passwordHelperGroup = passwordInput.closest('.form-group');
const passwordHelperText = passwordHelperGroup.querySelector('.helper-text');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;

const validationState = {
    email: false,
    password: false,
};

function updateLoginButtonState() {
    loginButton.disabled = !(
        validationState.email &&
        validationState.password
    );
}

emailInput.addEventListener('blur', () => {
    const email = emailInput.value;

    emailHelperText.textContent = ''; // 초기화
    emailHelperGroup.classList.remove('is-error'); // 초기화
    validationState.email = false;

    // 이메일이 비어 있는 경우
    if (email === '') {
        emailHelperText.textContent = '* 이메일을 입력해주세요.';
        emailHelperGroup.classList.add('is-error');
        updateLoginButtonState();
        return;
    }

    // 이메일 값을 입력하지 않은 경우, 입력값이 유효하지 않은 경우
    if (!emailRegex.test(email)) {
        emailHelperText.textContent = '* 올바른 이메일 주소 형식을 입력해주세요. (예: example@adapterz.kr)';
        emailHelperGroup.classList.add('is-error');
        updateLoginButtonState();
        return;
    }

    validationState.email = true;
    updateLoginButtonState();
});

passwordInput.addEventListener('blur', () => {
    const password = passwordInput.value;

    passwordHelperText.textContent = ''; // 초기화
    passwordHelperGroup.classList.remove('is-error'); // 초기화
    validationState.password = false;

    // 비밀번호 입력 안 했을 시
    if (password === '') { 
        passwordHelperText.textContent = '* 비밀번호를 입력해주세요.';
        passwordHelperGroup.classList.add('is-error');
        updateLoginButtonState();
        return;
    }

    // 비밀번호 확인 유효성을 통과 못하였을 경우
    if (!passwordRegex.test(password)) {
        passwordHelperText.textContent = '* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자,숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
        passwordHelperGroup.classList.add('is-error');
        updateLoginButtonState();
        return;
    }

    validationState.password = true;
    updateLoginButtonState();
});

loginButton.addEventListener('click', () => {
    // 로그인 요청
    // 로그인 실패 시
});