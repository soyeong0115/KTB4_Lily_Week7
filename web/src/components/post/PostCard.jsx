import { Link } from 'react-router-dom';

import { API_BASE_URL } from '../../api/client.js';
import { getAvatarColor } from '../../utils/avatarColor.js';

const TAG_COLORS = ['tag-yellow', 'tag-pink', 'tag-mint', 'tag-blue', 'tag-lilac'];

export default function PostCard({ post }) {
    const tagColor = TAG_COLORS[post.postId % TAG_COLORS.length];
    const nickname = post.writer.nickname;
    const avatarColor = getAvatarColor(post.writer.userId);

    return (
        <Link className="post-card" to={`/posts/${post.postId}`}>
            <span className={`post-card-tag ${tagColor}`}>{post.titlePreview}</span>

            {post.postImage && (
                <div className="post-card-image">
                    <img src={`${API_BASE_URL}${post.postImage}`} alt="" />
                </div>
            )}

            <p className="post-card-preview">{post.contentPreview ?? ''}</p>

            <div className="post-card-content">
                <div className="post-info-row">
                    <p className="post-stats-text">
                        <span className="stat-item">
                            <img className="stat-icon" src="/svg/heart.svg" alt="좋아요" />
                            {post.likeCount}
                        </span>
                        <span className="stat-item">
                            <img className="stat-icon" src="/svg/comment.svg" alt="댓글" />
                            {post.commentCount}
                        </span>
                        <span className="stat-item">
                            <img className="stat-icon" src="/svg/eye.svg" alt="조회수" />
                            {post.viewCount}
                        </span>
                    </p>
                    <time>{post.createdAt}</time>
                </div>
            </div>

            <div className="post-author">
                <div className="author-image" style={{ '--avatar-color': avatarColor }}>
                    {post.writer.profileImage
                        ? <img src={`${API_BASE_URL}${post.writer.profileImage}`} alt="" />
                        : nickname.charAt(0)}
                </div>
                <strong>{nickname}</strong>
            </div>
        </Link>
    );
}
