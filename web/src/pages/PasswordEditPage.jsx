import Header from '../components/layout/Header.jsx';
import SidebarTag from '../components/common/SidebarTag.jsx';
import PrimaryButton from '../components/common/PrimaryButton.jsx';
import Toast from '../components/common/Toast.jsx';
import { useEffect, useState } from 'react';
import { request } from '../api/client.js';
import { useModal } from '../hooks/useModal.js';

export default function PasswordEditPage() {
    const { showAlertModal, showLoginRequiredModal, isAuthError } = useModal();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordCheck, setNewPasswordCheck] = useState('');

    const [currentPasswordError, setCurrentPasswordError] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [newPasswordCheckError, setNewPasswordCheckError] = useState('');

    const [isToastVisible, setIsToastVisible] = useState(false);

    function validatePasswordForm() {
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;

        setCurrentPasswordError('');
        setNewPasswordError('');
        setNewPasswordCheckError('');

        let isValid = true;

        if (currentPassword.trim() === '') {
            setCurrentPasswordError('* 현재 비밀번호를 입력해주세요.');
            isValid = false;
        }

        if (newPassword.trim() === '') {
            setNewPasswordError('* 새 비밀번호를 입력해주세요.');
            isValid = false;
        } else if (!passwordRegex.test(newPassword)) {
            setNewPasswordError('* 비밀번호는 8자 이상, 20자 이하이며 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.');
            isValid = false;
        }

        if (newPasswordCheck.trim() === '') {
            setNewPasswordCheckError('* 새 비밀번호를 한번 더 입력해주세요.');
            isValid = false;
        } else if (newPassword !== newPasswordCheck) {
            setNewPasswordCheckError('* 비밀번호가 일치하지 않습니다.');
            isValid = false;
        }

        return isValid;
    }

    useEffect(() => {
        validatePasswordForm();
    }, [currentPassword, newPassword, newPasswordCheck]);

    async function handleSubmit() {
        if (!validatePasswordForm()) {
            return;
        }

        try {
            await request('/user/password', {
                method: 'PATCH',
                body: JSON.stringify({
                    password: currentPassword,
                    newPassword,
                }),
            });

            setCurrentPassword('');
            setNewPassword('');
            setNewPasswordCheck('');
            setIsToastVisible(true);
            
        } catch (error) {
            if (error.body?.message === 'password_mismatch') {
                setCurrentPasswordError('* 현재 비밀번호가 일치하지 않습니다.');
                return;
            }

            if (isAuthError(error)) {
                await showLoginRequiredModal();
                return;
            }

            await showAlertModal({ message: '비밀번호 수정에 실패했습니다.' });
            console.error(error);
        }
    }

    return (
        <>
            <Header backToPrevious />
            <main className="password-edit-main">
                <div className="post-create-heading">
                    <SidebarTag color="tag-mint">✎ Security</SidebarTag>
                    <h2 className="post-create-title">비밀번호 <span className="title-highlight">수정</span></h2>
                </div>

                <form className="password-edit-form">
                    <div className="form-group">
                        <label htmlFor="current-password"><SidebarTag color="tag-pink">CURRENT PASSWORD</SidebarTag></label>
                        <input 
                            id="current-password" 
                            type="password" 
                            placeholder="현재 비밀번호를 입력하세요" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <p className="helper-text">{currentPasswordError}</p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password"><SidebarTag color="tag-yellow">NEW PASSWORD</SidebarTag></label>
                        <input 
                            id="password" 
                            type="password" 
                            placeholder="새 비밀번호를 입력하세요" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <p className="helper-text">{newPasswordError}</p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password-check"><SidebarTag color="tag-blue">CONFIRM PASSWORD</SidebarTag></label>
                        <input 
                            id="password-check" 
                            type="password"
                            placeholder="새 비밀번호를 한번 더 입력하세요" 
                            value={newPasswordCheck}
                            onChange={(e) => setNewPasswordCheck(e.target.value)}
                        />
                        <p className="helper-text">{newPasswordCheckError}</p>
                    </div>

                    <PrimaryButton
                        disabled={
                            currentPassword.trim() === '' ||
                            newPassword.trim() === '' ||
                            newPasswordCheck.trim() === '' ||
                            currentPasswordError !== '' ||
                            newPasswordError !== '' ||
                            newPasswordCheckError !== ''
                        }
                        onClick={handleSubmit}
                    >
                        수정하기
                    </PrimaryButton>

                    <Toast message="수정 완료" isShow={isToastVisible} onHide={() => setIsToastVisible(false)} />
                </form>
            </main>
        </>
    );
}
