import { Link, useNavigate } from 'react-router-dom';

import SidebarTag from '../components/common/SidebarTag.jsx';
import PrimaryButton from '../components/common/PrimaryButton.jsx';
import { useState } from 'react';
import { request } from '../api/client.js';
import { useAuth } from '../hooks/useAuth.js';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');

    const [ emailError, setEmailError ] = useState('');
    const [ isEmailValid, setIsEmailValid ] = useState(false);

    const [ passwordError, setPasswordError ] = useState('');
    const [ isPasswordValid, setIsPasswordValid ] = useState(false);

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
            setPasswordError("* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자,숫자, 특수문자를 각각 최소 1개 포함해야 합니다.");
            setIsPasswordValid(false);
        } else {
            setPasswordError('');
            setIsPasswordValid(true);
        }
    }

    async function  handleLogin() {
        try {
            const data = await request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            login(data.accessToken);
            navigate('/');
            
        } catch (error) {
            setPasswordError('* 이메일 또는 비밀번호를 확인해주세요.');
        }

    }

    return (
        <main className="login-main">
            <div className="post-create-heading">
                <SidebarTag color="tag-yellow">✎ Welcome Back</SidebarTag>
                <h2 className="post-create-title"><span className="title-highlight">로그인</span></h2>
            </div>

            <form className="login-form">
                <div className={`form-group ${emailError ? 'is-error' : ''}`}>
                    <label htmlFor="email"><SidebarTag color="tag-mint">EMAIL</SidebarTag></label>
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
                    <label htmlFor="password"><SidebarTag color="tag-pink">PASSWORD</SidebarTag></label>
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

                <PrimaryButton disabled={!isEmailValid || !isPasswordValid} onClick={handleLogin}>로그인</PrimaryButton>
                <Link className="text-link" to="/signup">회원가입</Link>
            </form>
        </main>
    );
}
