import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
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
        return (
            <div className="post-list-empty">
                <img className="post-list-empty-icon" src="/svg/sad.svg" alt="" />
                <p>아직 게시글이 없어요.<br />BABBLE.에 첫 이야기를 남겨보세요!</p>
                <Link className="write-button post-list-empty-button" to="/posts/new">✎ 게시글 작성</Link>
            </div>
        );
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
