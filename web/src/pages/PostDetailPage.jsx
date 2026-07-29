import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Header from '../components/layout/Header.jsx';
import CommentForm from '../components/comment/CommentForm.jsx';
import CommentList from '../components/comment/CommentList.jsx';
import { API_BASE_URL, request } from '../api/client.js';
import { useModal } from '../hooks/useModal.js';
import { getAvatarColor } from '../utils/avatarColor.js';

export default function PostDetailPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { showConfirmModal, showAlertModal, showLoginRequiredModal, isAuthError } = useModal();

    const [post, setPost] = useState(null);
    const [isLiking, setIsLiking] = useState(false);
    const [editingComment, setEditingComment] = useState(null);

    const [navigationEntry] = performance.getEntriesByType('navigation'); // 이 페이지가 어떻게 로드됐는지에 대한 정보
    const shouldCountViewRef = useRef(navigationEntry?.type !== 'reload'); // 새로고침이 아니면 true (조회수 세기)

    async function fetchPostDetail() {
        const countParam = shouldCountViewRef.current
            ? ''
            : '?countView=false';

        try {
            const data = await request(`/posts/${postId}${countParam}`, {
                method: 'GET'
            });

            setPost(data);
            shouldCountViewRef.current = false;

        } catch (error) {
            await showAlertModal({ message: '게시글 상세 조회에 실패했습니다.' });
            console.error(error);
        }
    }

    useEffect(() => {
        fetchPostDetail();
    }, [postId]);

    async function handleDelete() {
        const confirmDelete = await showConfirmModal({ 
            title: '게시글을 삭제하시겠습니까?',
            message: '삭제한 내용은 복구할 수 없습니다.'
        });

        if (!confirmDelete) {
            return;
        }

        try {
            await request(`/posts/${postId}`, {
                method: 'DELETE'
            });
            navigate('/');
        } catch (error) {
            if (isAuthError(error)) {
                await showLoginRequiredModal();
                return;
            }

            await showAlertModal({ message: '게시글 삭제에 실패했습니다.' });
            console.error(error);
        }
    }

    async function handleLike() {
        setIsLiking(true);

        try {
            await request(`/posts/${postId}/likes`, {
                method: post.liked ? 'DELETE' : 'POST'
            });

            fetchPostDetail()
        } catch (error) {
            if (isAuthError(error)) {
                await showLoginRequiredModal();
                return;
            }

            await showAlertModal({ message: '좋아요 처리에 실패했습니다.' });
            console.error(error);
        } finally {
            setIsLiking(false);
        }
    }

    if (!post) {
        return null;
    }

    return (
        <>
            <Header backTo="/" />
            <main className="detail">
                <section className="detail-top">
                    <div className="detail-info">
                        <h2>{post.title}</h2>

                        <div className="detail-meta">
                            <span className="detail-avatar" style={{ '--avatar-color': getAvatarColor(post.writer.userId) }}>
                                {post.writer.profileImage
                                    ? <img src={`${API_BASE_URL}${post.writer.profileImage}`} alt="" />
                                    : post.writer.nickname.charAt(0)}
                            </span>
                            <span className="detail-author">{post.writer.nickname}</span>
                            <time>{post.createdAt}</time>
                        </div>
                    </div>

                    {post.myPost && (
                        <div className="small-button-group detail-button-group">
                            <Link className="small-button" to={`/posts/${postId}/edit`}>수정</Link>
                            <button className="small-button post-delete-button" type="button" onClick={handleDelete}>삭제</button>
                        </div>
                    )}
                </section>

                {post.postImage && (
                    <div className="post-image-box">
                        <img src={`${API_BASE_URL}${post.postImage}`} alt="" />
                    </div>
                )}

                <p className="post-content">{post.content}</p>

                <section className="post-stats">
                    <button
                        className={`stat-box${post.liked ? ' is-liked' : ''}`}
                        id="post-like-button"
                        type="button"
                        onClick={handleLike}
                        disabled={isLiking}
                    >
                        <strong>{post.likeCount}</strong>
                        <span>좋아요</span>
                    </button>

                    <div className="stat-box">
                        <strong>{post.viewCount}</strong>
                        <span>조회수</span>
                    </div>

                    <div className="stat-box">
                        <strong>{post.commentCount}</strong>
                        <span>댓글</span>
                    </div>
                </section>

                <CommentForm
                    postId={postId}
                    editingComment={editingComment}
                    onSuccess={() => {
                        setEditingComment(null);
                        fetchPostDetail();
                    }}
                />

                <CommentList
                    comments={post.comments ?? []}
                    postId={postId}
                    onEditRequest={setEditingComment}
                    onChanged={fetchPostDetail}
                />
            </main>
        </>
    );
}
