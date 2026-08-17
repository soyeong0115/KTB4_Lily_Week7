import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { List } from "react-window";
import { getPosts } from "../../api/postApi";
import { MOCK_COUNT, generateMockPosts } from "../../utils/mockData.js";
import PostRow from "./PostRow.jsx";

const CONTAINER_HEIGHT = 600;
const ROW_HEIGHT_WITH_IMAGE = 378;
const ROW_HEIGHT_WITHOUT_IMAGE = 214;

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

        if (MOCK_COUNT > 0) {
            const mockPosts = generateMockPosts(MOCK_COUNT);
            setPosts(mockPosts);
            setHasLoadedOnce(true);
            onPostsFetched(mockPosts);
            hasNextRef.current = false;
            isLoadingRef.current = false;
            return;
        }

        try {
            const { posts: newPosts, hasNext } = await getPosts({
                page: pageRef.current,
                size: POST_PAGE_SIZE,
            });

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

    function handleRowsRendered({ stopIndex }) {
        if (stopIndex >= posts.length - 1 && hasNextRef.current) {
            fetchPosts();
        }
    }

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
        <List
            rowComponent={PostRow}
            rowCount={posts.length}
            rowHeight={(index, { posts }) => posts[index].postImage ? ROW_HEIGHT_WITH_IMAGE : ROW_HEIGHT_WITHOUT_IMAGE}
            rowProps={{ posts }}
            onRowsRendered={handleRowsRendered}
            style={{ height: CONTAINER_HEIGHT }}
        />
    );
}
