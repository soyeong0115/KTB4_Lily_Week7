import { request } from './api.js';

const POST_PAGE_SIZE = 10;

const postList = document.querySelector('.post-list');
const postListSentinel = document.querySelector('.post-list-sentinel');

let currentPage = 0;
let hasNext = true;
let isLoading = false;

async function fetchPosts() {
    if (isLoading || !hasNext) {
        return;
    }

    isLoading = true;

    try {
        const { posts, hasNext: nextHasNext } = await request(
            `/posts?page=${currentPage}&size=${POST_PAGE_SIZE}`,
            { method: 'GET' }
        );

        renderPosts(posts, currentPage === 0);
        console.log('게시글 목록 데이터:', posts);

        currentPage += 1;
        hasNext = nextHasNext;
    }
    catch (error) {
        if (currentPage === 0) {
            postList.innerHTML = '<p>게시글을 불러오는데 실패했습니다.</p>';
        }
        console.error(error);
    }
    finally {
        isLoading = false;
    }
}

function renderPosts(posts, isFirstPage) {
    if (isFirstPage && posts.length === 0) {
        postList.innerHTML = '<p>게시글이 없습니다.</p>';
        return;
    }

    const postsHtml = posts.map((post) => {
        return `
            <a class="post-card" href="./post-detail.html?postId=${post.postId}">
                <div class="post-card-content">
                    <h3>${post.titlePreview}</h3>

                    <div class="post-info-row">
                        <p class="post-stats-text">
                            좋아요 ${post.likeCount}&nbsp;&nbsp;
                            댓글 ${post.commentCount}&nbsp;&nbsp;
                            조회수 ${post.viewCount}
                        </p>
                        <time>${post.createdAt}</time>
                    </div>
                </div>

                <div class="post-author">
                    <div class="author-image"></div>
                    <strong>${post.writer.nickname}</strong>
                </div>
            </a>
        `;
    }).join('');

    postList.insertAdjacentHTML('beforeend', postsHtml);
}

const postListObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        fetchPosts();
    }
});

postListObserver.observe(postListSentinel);

fetchPosts();