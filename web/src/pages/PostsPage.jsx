import { useRef, useState } from "react";
import Header from "../components/layout/Header";
import PostSidebar from "../components/post/PostSidebar";
import PostList from "../components/post/PostList";
import PopularPosts from "../components/post/PopularPosts";

export default function PostsPage() {
    const [ contributors, setContributors ] = useState([]);
    const seenContributorsRef = useRef(new Set());

    function handlePostsFetched(newPosts) {
        const newContributors = [];

        newPosts.forEach(post => {
            const { userId, nickname, profileImage } = post.writer;

            if (!seenContributorsRef.current.has(userId) && seenContributorsRef.current.size + newContributors.length < 8) {
                seenContributorsRef.current.add(userId);
                newContributors.push({ userId, nickname, profileImage });
            }
        });

        if (newContributors.length > 0) {
            setContributors((prev) => [...prev, ...newContributors]);
        }
    }

    return (
        <div className="posts-page">
            <Header />
            <main className="posts-main">
                <div className="posts-layout">
                    <PostSidebar contributors={contributors} />
                    <section className="post-list">
                        <PopularPosts />
                        <PostList onPostsFetched={handlePostsFetched} />
                    </section>
                </div>
            </main>
        </div>
    );
}
