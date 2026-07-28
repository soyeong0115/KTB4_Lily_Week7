import { useCallback, useRef, useState } from "react";
import { request } from "../../api/client";

export default function PostList({ onPostsFetched }) {
    const pageRef = useRef(0);
    const hasNextRef = useRef(true);
    const isLoadingRef = useRef(false);
    const [ posts, setPosts ] = useState([]);

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
            onPostsFetched(newPosts); // Contributors 계산용
            pageRef.current += 1;
            hasNextRef.current = hasNext;
        } catch (error) {
            console.error(error);
        } finally {
            isLoadingRef.current = false;
        }
    }, [onPostsFetched]);

}
