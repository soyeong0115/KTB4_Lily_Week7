import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Header from '../components/layout/Header.jsx';
import CommentForm from '../components/comment/CommentForm.jsx';
import CommentList from '../components/comment/CommentList.jsx';
import { API_BASE_URL } from '../api/client.js';
import { getPost, deletePost, likePost, unlikePost } from '../api/postApi.js';
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
        try {
            const countView = shouldCountViewRef.current;
            shouldCountViewRef.current = false;

            const data = await getPost(postId, { countView });

            setPost(data);
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
            await deletePost(postId);
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
            await (post.liked ? unlikePost(postId) : likePost(postId));

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
            <Header backToPrevious />
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
                            <span className="detail-view-count">
                                <img className="detail-stat-icon" src="/svg/eye.svg" alt="조회수" />
                                {post.viewCount}
                            </span>

                            {post.myPost && (
                                <div className="small-button-group detail-button-group">
                                    <Link className="small-button" to={`/posts/${postId}/edit`}>수정</Link>
                                    <button className="small-button post-delete-button" type="button" onClick={handleDelete}>삭제</button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {post.postImage && (
                    <div className="post-image-box">
                        <img src={`${API_BASE_URL}${post.postImage}`} alt="" />
                    </div>
                )}

                <p className="post-content">{post.content}</p>

                <section className="detail-stats">
                    <button
                        className={`detail-stat-pill detail-like-button${post.liked ? ' is-liked' : ''}`}
                        type="button"
                        onClick={handleLike}
                        disabled={isLiking}
                    >
                        <svg className="detail-stat-icon" viewBox="0 0 14 14" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 12.2C4.4 10.4 1.4 8.3 1.4 5.3 1.4 3.4 2.9 2 4.7 2c1 0 2 .5 2.3 1.3C7.3 2.5 8.3 2 9.3 2c1.8 0 3.3 1.4 3.3 3.3 0 3-3 5.1-5.6 6.9Z" />
                        </svg>
                        <span className="detail-stat-text"><span>좋아요</span><span>{post.likeCount}</span></span>
                    </button>

                    <span className="detail-stat-pill">
                        <img className="detail-stat-icon" src="/svg/comment.svg" alt="댓글" />
                        <span className="detail-stat-text"><span>댓글</span><span>{post.commentCount}</span></span>
                    </span>
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
