import Header from '../components/layout/Header.jsx';
import SidebarTag from '../components/common/SidebarTag.jsx';
import Toast from '../components/common/Toast.jsx';
import { API_BASE_URL, request } from '../api/client.js';
import { useEffect, useState } from 'react';
import { useModal } from '../hooks/useModal.js';

export default function ProfileEditPage() {
    const { showAlertModal, showLoginRequiredModal, isAuthError } = useModal();
    const [email, setEmail] = useState('');
    const [nickname, setNickname] = useState('');
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const [error, setError] = useState('');
    const [isToastVisible, setIsToastVisible] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const data = await request('/user/profile', {
                    method: 'GET'
                });

                setEmail(data.email);
                setNickname(data.nickname);
                setProfileImageUrl(data.profileImage);

            } catch (error) {
                if (isAuthError(error)) {
                    await showLoginRequiredModal();
                    return;
                }

                await showAlertModal({ message: '회원정보를 불러오지 못했습니다.' });
                console.error(error);
            }
        }

        fetchProfile();
    }, []);

    async function handleImageChange(e) {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        try {
            const data = await request('/images', {
                method: 'POST',
                body: formData
            });

            setProfileImageUrl(data.imageUrl);

        } catch(error) {
            if (isAuthError(error)) {
                await showLoginRequiredModal();
                return;
            }

            await showAlertModal({ message: '프로필 이미지 변경에 실패했습니다.'});
            console.error(error);
        }
    }

    return (
        <>
            <Header />
            <main className="profile-edit-main">
                <div className="post-create-heading">
                    <SidebarTag color="tag-blue">✎ My Profile</SidebarTag>
                    <h2 className="post-create-title">회원정보 <span className="title-highlight">수정</span></h2>
                </div>

                <form className="profile-edit-form">
                    <section className="profile-edit-image-area">
                        <label className="profile-edit-label"><SidebarTag color="tag-pink">PROFILE IMAGE</SidebarTag></label>

                        <input
                            id="profileImageInput"
                            className="profile-image-input"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />

                        <label className="profile-edit-image" htmlFor="profileImageInput">
                            <div className="profile-edit-photo">
                                {profileImageUrl 
                                    ? <img src={ `${API_BASE_URL}${profileImageUrl}` } alt="" /> 
                                    : null}
                            </div>
                            <span>변경</span>
                        </label>
                    </section>

                    <div className="profile-edit-field">
                        <label htmlFor="email"><SidebarTag color="tag-mint">EMAIL</SidebarTag></label>
                        <p id="email">{email}</p>
                    </div>

                    <div className="profile-edit-field">
                        <label htmlFor="nickname"><SidebarTag color="tag-yellow">NICKNAME</SidebarTag></label>
                        <input 
                            id="nickname" 
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                         />
                        <p className="profile-helper-text"></p>
                    </div>

                    <button className="profile-submit-button" type="button">수정하기</button>

                    <button className="profile-withdraw-button" type="button">
                        회원 탈퇴
                    </button>

                    <Toast message="수정완료" isShow={false} onHide={() => {}} />
                </form>
            </main>
        </>
    );
}
