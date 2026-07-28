import { useCallback, useEffect, useRef, useState } from "react";
import { request } from "../../api/client";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import PostCard from "./PostCard.jsx";

export default function PostList({ onPostsFetched }) {
    const pageRef = useRef(0);
    const hasNextRef = useRef(true);
    const isLoadingRef = useRef(false);
    const [ posts, setPosts ] = useState([]);
    const [ hasLoadedOnce, setHasLoadedOnce ] = useState(false);

    const POST_PAGE_SIZE = 10;

    const fetchPosts = useCallback(async() => {
        if (isLoadingRef.current || !hasNextRef.current) return;
        isLoadingRef.current = true;

        try {
            const { posts: newPosts, hasNext } = await request(
                `/posts?page=${pageRef.current}&size=${POST_PAGE_SIZE}`,
                { method: 'GET' }
            );

            setPosts((prev) => [...prev, ...newPosts]); // 기존 목록 뒤에 새로 받아온 post 이어 붙임
            setHasLoadedOnce(true);
            onPostsFetched(newPosts); // Contributors 계산용
            pageRef.current += 1;
            hasNextRef.current = hasNext;
        } catch (error) {
            console.error(error);
        } finally {
            isLoadingRef.current = false;
        }
    }, [onPostsFetched]);

    useEffect(() => {
        fetchPosts();
    }, []);

    const targetRef = useInfiniteScroll({ onIntersect: fetchPosts, isLoadingRef, hasNextPageRef: hasNextRef });

    if (hasLoadedOnce && posts.length === 0) {
        return <p>게시글이 없습니다.</p>;
    }

    return (
        <>
            {posts.map((post) => (
                <PostCard post={post} key={post.postId} />
            ))}
            <div ref={targetRef}></div>
        </>
    );
}
