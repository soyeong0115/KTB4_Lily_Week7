import { request, API_BASE_URL } from './api.js';
import { getAvatarColor } from './avatar.js';

const POST_PAGE_SIZE = 10;

const TAG_COLORS = ['tag-yellow', 'tag-pink', 'tag-mint', 'tag-blue', 'tag-lilac'];
const GRAPHIC_HEIGHTS = ['graphic-a', 'graphic-b', 'graphic-c', 'graphic-d'];
const GRAPHIC_PATTERNS = ['pattern-1', 'pattern-2', 'pattern-3', 'pattern-4', 'pattern-5'];
const CONTRIBUTOR_LIMIT = 8;

const postList = document.querySelector('.post-list');
const postListSentinel = document.querySelector('.post-list-sentinel');
const contributorGrid = document.querySelector('.contributor-grid');

const seenContributors = new Set();

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
        const tagColor = TAG_COLORS[post.postId % TAG_COLORS.length];
        const graphicHeight = GRAPHIC_HEIGHTS[post.postId % GRAPHIC_HEIGHTS.length];
        const graphicPattern = GRAPHIC_PATTERNS[post.postId % GRAPHIC_PATTERNS.length];
        const nickname = post.writer.nickname;
        const avatarColor = getAvatarColor(post.writer.userId);
        const avatarContent = post.writer.profileImage
            ? `<img src="${API_BASE_URL}${post.writer.profileImage}" alt="" />`
            : nickname.charAt(0);

        return `
            <a class="post-card" href="./post-detail.html?postId=${post.postId}">
                <span class="post-card-tag ${tagColor}">${post.titlePreview}</span>
                <div class="post-card-graphic ${graphicHeight} ${graphicPattern}"></div>

                <div class="post-card-content">
                    <div class="post-info-row">
                        <p class="post-stats-text">
                            좋아요 ${post.likeCount} · 댓글 ${post.commentCount} · 조회수 ${post.viewCount}
                        </p>
                        <time>${post.createdAt}</time>
                    </div>
                </div>

                <div class="post-author">
                    <div class="author-image" style="--avatar-color: ${avatarColor}">${avatarContent}</div>
                    <strong>${nickname}</strong>
                </div>
            </a>
        `;
    }).join('');

    postList.insertAdjacentHTML('beforeend', postsHtml);
    renderContributors(posts);
}

function renderContributors(posts) {
    if (!contributorGrid) {
        return;
    }

    const newContributors = [];

    posts.forEach((post) => {
        const { userId, nickname, profileImage } = post.writer;

        if (!seenContributors.has(userId) && seenContributors.size + newContributors.length < CONTRIBUTOR_LIMIT) {
            seenContributors.add(userId);
            newContributors.push({ userId, nickname, profileImage });
        }
    });

    if (newContributors.length === 0) {
        return;
    }

    const contributorsHtml = newContributors
        .map(({ userId, nickname, profileImage }) => {
            const avatarContent = profileImage
                ? `<img src="${API_BASE_URL}${profileImage}" alt="" />`
                : nickname.charAt(0);

            return `<li class="contributor-avatar" title="${nickname}" style="--avatar-color: ${getAvatarColor(userId)}">${avatarContent}</li>`;
        })
        .join('');

    contributorGrid.insertAdjacentHTML('beforeend', contributorsHtml);
}

const postListObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        fetchPosts();
    }
});

postListObserver.observe(postListSentinel);

fetchPosts();