import { useEffect, useState } from "react";
import { request } from "../../api/client";
import PostCard from "./PostCard.jsx";

export default function PopularPosts() {
    const [popularPosts, setPopularPosts] = useState([]);

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

    return (
        <section className="popular-posts">
            <h2 className="popular-posts-title">
                <img className="popular-posts-icon" src="/svg/fire.svg" alt="" />
                인기글
            </h2>

            <div className="popular-posts-list">
                {popularPosts.map((post) => (
                    <div className="popular-posts-item" key={post.postId}>
                        <PostCard post={post} />
                    </div>
                ))}
            </div>
        </section>
    );
}