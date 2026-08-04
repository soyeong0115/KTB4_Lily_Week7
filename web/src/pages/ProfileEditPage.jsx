import Header from '../components/layout/Header.jsx';
import SidebarTag from '../components/common/SidebarTag.jsx';
import Toast from '../components/common/Toast.jsx';
import { API_BASE_URL, uploadImage } from '../api/client.js';
import { getProfile, updateProfile, deleteUser } from '../api/userApi.js';
import { useEffect, useState } from 'react';
import { useModal } from '../hooks/useModal.js';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';

export default function ProfileEditPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { showAlertModal, showConfirmModal, showLoginRequiredModal, isAuthError } = useModal();
    const [email, setEmail] = useState('');
    const [nickname, setNickname] = useState('');
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const [error, setError] = useState('');
    const [isToastVisible, setIsToastVisible] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const data = await getProfile();

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

        try {
            const imageUrl = await uploadImage(file);

            setProfileImageUrl(imageUrl);

        } catch(error) {
            if (isAuthError(error)) {
                await showLoginRequiredModal();
                return;
            }

            await showAlertModal({ message: '프로필 이미지 변경에 실패했습니다.'});
            console.error(error);
        }
    }

    async function handleSubmit() {
        if (nickname.trim() === '') {
            setError('* 닉네임을 입력해주세요.');
            return;
        }

        if (nickname.length > 10) {
            setError('* 닉네임은 최대 10자까지 작성 가능합니다.');
            return;
        }

        try {
            await updateProfile({ nickname, profileImage: profileImageUrl });

            setError('');
            setIsToastVisible(true);
        } catch (error) {
            if (error.body?.message === 'nickname_duplicated') {
                setError('* 중복된 닉네임입니다.');
                return;
            }

            if (isAuthError(error)) {
                await showLoginRequiredModal();
                return;
            }

            await showAlertModal({ message: '회원정보 수정에 실패했습니다.' });
            console.error(error);
        }
    }

    async function handleWithdraw() {
        const comfirmWithdraw = await showConfirmModal({
            title: '회원탈퇴 하시겠습니까?',
            message: '작성된 게시글과 댓글은 삭제됩니다.'
        });

        if (!comfirmWithdraw) {
            return;
        }

        try {
            await deleteUser();

            logout();
            navigate('/login');

        } catch (error) {
            if (isAuthError(error)) {
                await showLoginRequiredModal();
                return;
            }

            await showAlertModal({ message: '회원탈퇴에 실패했습니다.' });
            console.error(error);
        }
    }

    return (
        <>
            <Header backToPrevious />
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
                        <p className="profile-helper-text">{error}</p>
                    </div>

                    <button className="profile-submit-button" type="button" onClick={handleSubmit}>수정하기</button>

                    <button className="profile-withdraw-button" type="button" onClick={handleWithdraw}>
                        회원 탈퇴
                    </button>

                    <Toast message="수정완료" isShow={isToastVisible} onHide={() => setIsToastVisible(false)} />
                </form>
            </main>
        </>
    );
}
