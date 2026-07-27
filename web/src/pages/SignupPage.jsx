import { Link, useNavigate } from 'react-router-dom';

import SidebarTag from '../components/common/SidebarTag.jsx';
import PrimaryButton from '../components/common/PrimaryButton.jsx';
import { useState } from 'react';
import { request } from '../api/client.js';

export default function SignupPage() {
    const navigate = useNavigate();

    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ passwordCheck, setPasswordCheck ] = useState('');
    const [ nickname, setNickname ] = useState('');

    const [ emailError, setEmailError ] = useState('');
    const [ isEmailValid, setIsEmailValid ] = useState(false);

    const [ passwordError, setPasswordError ] = useState('');
    const [ isPasswordValid, setIsPasswordValid ] = useState(false);

    const [ passwordCheckError, setPasswordCheckError ] = useState('');
    const [ isPasswordCheckValid, setIsPasswordCheckValid ] = useState(false);

    const [ nicknameError, setNicknameError ] = useState('');
    const [ isNicknameValid, setIsNicknameValid ] = useState(false);
 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;
    
    function handleEmailBlur() {
        if (email === '') {
            setEmailError('* 이메일을 입력해주세요.');
            setIsEmailValid(false);
        } else if (!emailRegex.test(email)) {
            setEmailError('* 올바른 이메일 주소 형식을 입력해주세요. (예: example@babble.com');
            setIsEmailValid(false);
        } else {
            setEmailError('');
            setIsEmailValid(true);
        }
    }

    function handlePasswordBlur() {
        if (password === '') {
            setPasswordError('* 비밀번호를 입력해주세요.');
            setIsPasswordValid(false);
        } else if (!passwordRegex.test(password)) {
            setPasswordError('* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자,숫자, 특수문자를 각각 최소 1개 포함해야 합니다.');
            setIsPasswordValid(false);
        } else {
            setPasswordError('');
            setIsPasswordValid(true);
        }
    }

    function handlePasswordCheckBlur() {
        if (passwordCheck === '') {
            setPasswordCheckError('* 비밀번호를 한번 더 입력해주세요.');
            setIsPasswordCheckValid(false);
        } else if (!passwordRegex.test(passwordCheck)) {
            setPasswordCheckError('* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자,숫자, 특수문자를 각각 최소 1개 포함해야 합니다.');
            setIsPasswordCheckValid(false);
        } else if (password !== passwordCheck) {
            setPasswordCheckError('* 비밀번호가 다릅니다.');
            setPasswordError('* 비밀번호가 다릅니다.');
            setIsPasswordCheckValid(false);
        } else {
            setPasswordError('');
            setIsPasswordCheckValid(true);
        }
    }

    function handleNicknameBlur() {
        if (nickname === '') {
            setNicknameError('* 닉네임을 입력해주세요.');
            setIsNicknameValid(false);
        } else if (nickname.includes(' ')) {
            setNicknameError('* 띄어쓰기를 없애주세요.');
            setIsNicknameValid(false);
        } else if (nickname.length > 10) {
            setNicknameError('* 닉네임은 최대 10자까지 작성 가능합니다.');
            setIsNicknameValid(false);
        } else {
            setNicknameError('');
            setIsNicknameValid(true);
        }
    }

    async function handleSignup() {
        try {
            const data = await request('/auth/signup', {
                method: 'POST',
                body: JSON.stringify({ email, password, nickname }),
            });

            navigate('/login');
        } catch (error) {
            const message = error.body?.message;

            if (message === 'email_duplicated') {
                setEmailError('* 중복된 이메일 입니다.');
                setIsEmailValid(false);
                return;
            }

            if (message === 'nickname_duplicated') {
                setNicknameError('* 중복된 닉네임 입니다.');
                return;
            }
        }
    }

    return (
        <main className="signup-main">
            <div className="post-create-heading">
                <SidebarTag color="tag-pink">✎ Join Us</SidebarTag>
                <h2 className="post-create-title">회원<span className="title-highlight">가입</span></h2>
            </div>

            <form className="signup-form">
                <section className="signup-profile-area">
                    <label className="profile-image-label"><SidebarTag color="tag-lilac">PROFILE IMAGE</SidebarTag></label>
                    <p className="helper-text"></p>

                    <input
                        id="profileImageInput"
                        className="profile-image-input"
                        type="file"
                        accept="image/*"
                    />

                    <label className="profile-image" htmlFor="profileImageInput">＋</label>
                </section>

                <div className={`form-group ${emailError ? 'is-error' : ''}`}>
                    <label htmlFor="email"><SidebarTag color="tag-mint">EMAIL*</SidebarTag></label>
                    <input 
                        id="email" 
                        type="email" 
                        placeholder="이메일을 입력하세요" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={handleEmailBlur}
                    />
                    <p className="helper-text">{emailError}</p>
                </div>

                <div className={`form-group ${passwordError ? 'is-error' : ''}`}>
                    <label htmlFor="password"><SidebarTag color="tag-yellow">PASSWORD*</SidebarTag></label>
                    <input 
                        id="password" 
                        type="password" 
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={handlePasswordBlur}
                     />
                    <p className="helper-text">{passwordError}</p>
                </div>

                <div className={`form-group ${passwordCheckError ? 'is-error' : ''}`}>
                    <label htmlFor="password-check"><SidebarTag color="tag-blue">CONFIRM PASSWORD*</SidebarTag></label>
                    <input 
                        id="password-check"
                        type="password" 
                        placeholder="비밀번호를 한번 더 입력하세요"
                        value={passwordCheck}
                        onChange={(e) => setPasswordCheck(e.target.value)}
                        onBlur={handlePasswordCheckBlur}
                    />
                    <p className="helper-text">{passwordCheckError}</p>
                </div>

                <div className={`form-group ${nicknameError ? 'is-error' : ''}`}>
                    <label htmlFor="nickname"><SidebarTag color="tag-pink">NICKNAME*</SidebarTag></label>
                    <input 
                        id="nickname" 
                        type="text" 
                        placeholder="닉네임을 입력하세요" 
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        onBlur={handleNicknameBlur}
                    />
                    <p className="helper-text">{nicknameError}</p>
                </div>

                <PrimaryButton disabled={!isEmailValid || !isPasswordValid || !isPasswordCheckValid || !isNicknameValid} onClick={handleSignup}>회원가입</PrimaryButton>
                <Link className="login-link-button" to="/login">로그인하러 가기</Link>
            </form>
        </main>
    );
}
