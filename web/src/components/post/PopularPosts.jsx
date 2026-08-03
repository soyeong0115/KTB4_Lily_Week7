import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL, request } from "../../api/client";
import { getAvatarColor } from "../../utils/avatarColor.js";

export default function PopularPosts() {
    const [popularPosts, setPopularPosts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        async function fetchPopularPosts() {
            try {
                const data = await request('/posts/popular?limit=5', {
                    method: "GET"
                })

                setPopularPosts(data)

            } catch(error) {
                console.error(error);
            }
        }

        fetchPopularPosts();

    }, []);

    if (popularPosts.length === 0) {
        return null;
    }

    const post = popularPosts[currentIndex];
    const nickname = post.writer.nickname;
    const bannerStyle = post.postImage
        ? { backgroundImage: `url(${API_BASE_URL}${post.postImage})` }
        : { backgroundColor: getAvatarColor(post.postId) };

    return (
        <section className="popular-posts">
            <Link to={`/posts/${post.postId}`} className="popular-posts-banner" style={bannerStyle}>
                <div className="popular-posts-overlay" />

                <span className="popular-posts-badge">
                    <img className="popular-posts-icon" src="/svg/fire.svg" alt="" />
                    인기글
                </span>

                <div className="popular-posts-content">
                    <h2 className="popular-posts-post-title">{post.titlePreview}</h2>

                    <div className="popular-posts-author">
                        <div className="popular-posts-avatar" style={{ '--avatar-color': getAvatarColor(post.writer.userId) }}>
                            {post.writer.profileImage
                                ? <img src={`${API_BASE_URL}${post.writer.profileImage}`} alt="" />
                                : nickname.charAt(0)}
                        </div>
                        <span>{nickname}</span>
                    </div>
                </div>
            </Link>
        </section>
    );
}
