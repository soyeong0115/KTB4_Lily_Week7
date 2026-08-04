import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../api/client";
import { getPopularPosts } from "../../api/postApi";
import { getAvatarColor } from "../../utils/avatarColor.js";

const SLIDE_INTERVAL_MS = 4000;

export default function PopularPosts() {
    const [popularPosts, setPopularPosts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        async function fetchPopularPosts() {
            try {
                const data = await getPopularPosts(5)

                setPopularPosts(data)

            } catch(error) {
                console.error(error);
            }
        }

        fetchPopularPosts();

    }, []);

    const maxIndex = popularPosts.length - 1;

    function goToNext() {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }

    function goToPrev() {
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    }

    useEffect(() => {
        if (maxIndex <= 0) return;

        const timer = setInterval(goToNext, SLIDE_INTERVAL_MS);

        return () => clearInterval(timer);
    }, [maxIndex, currentIndex]);

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

                {maxIndex > 0 && (
                    <>
                        <button
                            type="button"
                            className="popular-posts-arrow popular-posts-arrow-left"
                            onClick={(e) => { e.preventDefault(); goToPrev(); }}
                            aria-label="이전 인기글"
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            className="popular-posts-arrow popular-posts-arrow-right"
                            onClick={(e) => { e.preventDefault(); goToNext(); }}
                            aria-label="다음 인기글"
                        >
                            ›
                        </button>
                    </>
                )}
            </Link>

            {maxIndex > 0 && (
                <div className="popular-posts-dots">
                    {popularPosts.map((p, index) => (
                        <button
                            type="button"
                            key={p.postId}
                            className={`popular-posts-dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(index)}
                            aria-label={`${index + 1}번째로 이동`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
