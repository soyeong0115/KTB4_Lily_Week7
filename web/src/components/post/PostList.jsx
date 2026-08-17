import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import { getPosts } from "../../api/postApi";
import { MOCK_COUNT, generateMockPosts } from "../../utils/mockData.js";
import PostCard from "./PostCard.jsx";

const CONTAINER_HEIGHT = 600;
const LANES = 3;   // 열 개수 (기존 masonry의 column-count: 3)
const GAP = 24;    // 카드 사이 간격 (기존 column-gap / margin-bottom)
const ESTIMATED_HEIGHT_WITH_IMAGE = 378;
const ESTIMATED_HEIGHT_WITHOUT_IMAGE = 214;

export default function PostList({ onPostsFetched }) {
    const pageRef = useRef(0);
    const hasNextRef = useRef(true);
    const isLoadingRef = useRef(false);
    const [ posts, setPosts ] = useState([]);
    const [ hasLoadedOnce, setHasLoadedOnce ] = useState(false);

    const scrollRef = useRef(null);
    const [ columnWidth, setColumnWidth ] = useState(0);

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

    // 컨테이너 폭을 측정해 열 하나의 너비를 계산 (반응형 대응 위해 ResizeObserver 사용)
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        function updateWidth() {
            const totalWidth = el.clientWidth;
            setColumnWidth((totalWidth - GAP * (LANES - 1)) / LANES);
        }

        updateWidth();
        const observer = new ResizeObserver(updateWidth);
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasLoadedOnce]);

    const virtualizer = useVirtualizer({
        count: posts.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: (index) =>
            posts[index]?.postImage ? ESTIMATED_HEIGHT_WITH_IMAGE : ESTIMATED_HEIGHT_WITHOUT_IMAGE,
        lanes: LANES,
        gap: GAP,
        overscan: 3,
    });

    const virtualItems = virtualizer.getVirtualItems();

    useEffect(() => {
        const lastItem = virtualItems[virtualItems.length - 1];
        if (lastItem && lastItem.index >= posts.length - 1) {
            fetchPosts();
        }
    }, [virtualItems, posts.length, fetchPosts]);

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
        <div
            ref={scrollRef}
            className="post-virtual-container"
            style={{ height: CONTAINER_HEIGHT, overflowY: 'auto' }}
        >
            <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
                {virtualItems.map((item) => (
                    <div
                        key={item.key}
                        data-index={item.index}
                        ref={virtualizer.measureElement}
                        className="post-virtual-item"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: item.lane * (columnWidth + GAP),
                            width: columnWidth,
                            transform: `translateY(${item.start}px)`,
                        }}
                    >
                        <PostCard post={posts[item.index]} />
                    </div>
                ))}
            </div>
        </div>
    );
}
