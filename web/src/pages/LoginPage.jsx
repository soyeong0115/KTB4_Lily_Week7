import { Link } from 'react-router-dom';

import SidebarTag from '../components/common/SidebarTag.jsx';
import PrimaryButton from '../components/common/PrimaryButton.jsx';
import { useState } from 'react';

export default function LoginPage() {
    // TODO: 검증 로직, 제출 핸들러 구현
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');


    return (
        <main className="login-main">
            <div className="post-create-heading">
                <SidebarTag color="tag-yellow">✎ Welcome Back</SidebarTag>
                <h2 className="post-create-title"><span className="title-highlight">로그인</span></h2>
            </div>

            <form className="login-form">
                <div className="form-group">
                    <label htmlFor="email"><SidebarTag color="tag-mint">EMAIL</SidebarTag></label>
                    <input 
                        id="email" 
                        type="email" 
                        placeholder="이메일을 입력하세요" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <p className="helper-text"></p>
                </div>

                <div className="form-group">
                    <label htmlFor="password"><SidebarTag color="tag-pink">PASSWORD</SidebarTag></label>
                    <input 
                        id="password" 
                        type="password" 
                        placeholder="비밀번호를 입력하세요" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <p className="helper-text"></p>
                </div>

                <PrimaryButton disabled>로그인</PrimaryButton>
                <Link className="text-link" to="/signup">회원가입</Link>
            </form>
        </main>
    );
}
