const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const loginButton = document.querySelector('#login-button');

const loginHelperText = document.querySelector('.helper-text');
const helperGroup = loginHelperText.closest('.form-group');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;

loginButton.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    loginHelperText.textContent = ''; // 초기화
    helperGroup.classList.remove('is-error'); // 초기화

    // 유효성 검사
    // 이메일이 비어 있는 경우
    if (email === '') {
        loginHelperText.textContent = '* 이메일을 입력해주세요.';
        helperGroup.classList.add('is-error');
        return;
    }

    // 이메일 값을 입력하지 않은 경우, 입력값이 유효하지 않은 경우
    if (!emailRegex.test(email)) {
        loginHelperText.textContent = '* 올바른 이메일 주소 형식을 입력해주세요. (예: example@adapterz.kr)';
        helperGroup.classList.add('is-error');
        return;
    }

    // 비밀번호 입력 안 했을 시
    if (password === '') { 
        loginHelperText.textContent = '* 비밀번호를 입력해주세요.';
        helperGroup.classList.add('is-error');
        return;
    }

    // 비밀번호 확인 유효성을 통과 못하였을 경우
    if (!passwordRegex.test(password)) {
        loginHelperText.textContent = '* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자,숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
        helperGroup.classList.add('is-error');
        return;
    }

    // 비밀번호 입력 후 로그인 실패 시
});