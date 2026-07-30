import { useEffect, useRef, useState } from 'react';
import SidebarTag from '../common/SidebarTag.jsx';
import { request } from '../../api/client.js';
import { useModal } from '../../hooks/useModal.js';
import { useNavigate } from 'react-router-dom';

export default function PostForm({ mode, postId }) {
    const { showAlertModal, showLoginRequiredModal, isAuthError } = useModal();
    const navigate = useNavigate();
    const isEditMode = mode === 'edit';

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState(null);
    const [filename, setFilename] = useState('파일을 선택해주세요.');
    const [error, setError] = useState('');

    const fileInputRef = useRef(null);

    async function handleImageChange(e) {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            const data = await request('/images', {
                method: 'POST',
                body: formData,
            });
        
            setImageUrl(data.imageUrl);
            setFilename(file.name);
        
        } catch (error) {
            await showAlertModal({ message: '이미지 업로드에 실패했습니다.' });
            console.error(error);
        }
    }

    useEffect(() => {
        if (!isEditMode) return;

        async function fetchPost() {
            try {
                const data = await request(`/posts/${postId}`, {
                    method: 'GET'
                });

                setTitle(data.title);
                setContent(data.content);

                if (data.postImage) {
                    setImageUrl(data.postImage);
                    setFilename(data.postImage.split('/').pop());
                }
            } catch (error) {
                await showAlertModal({ message: '게시글 정보를 불러오지 못했습니다.' })
                console.error(error);
            }
        }

        fetchPost();     
    }, [postId]);

    async function handleSubmit() {
        if (title.trim() === '' || content.trim() === '') {
            setError('* 제목과 내용을 모두 입력해주세요.');
            return;
        }

        const url = isEditMode ? `/posts/${postId}` : '/posts';
        const method = isEditMode ? 'PATCH' : 'POST';

        try {
            await request(url, {
                method,
                body: JSON.stringify({
                    title,
                    content,
                    postImage: imageUrl
                })
            });

            navigate(isEditMode ? `/posts/${postId}` : '/');

        } catch (error) {
            if (isAuthError(error)) {
                await showLoginRequiredModal();
                return;
            }

            await showAlertModal(isEditMode
                ? { message: '게시글 수정에 실패했습니다.' }
                : { message: '게시글 작성에 실패했습니다.' }
            );
            console.error(error);
        }
    }

    return (
        <main className="post-create-main">
            <div className="post-create-heading">
                <SidebarTag color={isEditMode ? 'tag-pink' : 'tag-yellow'}>
                    {isEditMode ? '✎ Edit Post' : '✎ New Post'}
                </SidebarTag>
                <h2 className="post-create-title">
                    게시글 <span className="title-highlight">{isEditMode ? '수정' : '작성'}</span>
                </h2>
            </div>

            <form className="post-create-form">
                <div className="post-form-group">
                    <label htmlFor="title">제목*</label>
                    <input
                        id="title"
                        type="text"
                        maxLength={26}
                        required
                        placeholder="제목을 입력해주세요. (최대 26글자)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="post-form-group">
                    <label htmlFor="content">내용*</label>
                    <textarea
                        id="content"
                        required
                        placeholder="내용을 입력해주세요."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                    <p className="helper-text">{error}</p>
                </div>

                <div className="post-form-group image-group">
                    <label>이미지</label>

                    <div className="file-row">
                        <button 
                            className="file-button"
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                        >파일 선택</button>
                        <span>{filename}</span>
                        <input 
                            id="postImageInput" 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            hidden 
                            onChange={handleImageChange}
                        />
                    </div>
                </div>

                <button className="post-submit-button" type="button" onClick={handleSubmit}>
                    {isEditMode ? '수정하기' : '글 발행하기'}
                </button>
            </form>
        </main>
    );
}
