import { request } from './api.js';

const postList = document.querySelector('.post-list');

async function fetchPosts() {
    try {
        const posts = await request('/posts', { method: 'GET' });

        renderPosts(posts);
        console.log('게시글 목록 데이터:', posts);
    }
    catch (error) {
        postList.innerHTML = '<p>게시글을 불러오는데 실패했습니다.</p>';
        console.error(error);
    }
}

function renderPosts(posts) {
    if (posts.length === 0) {
        postList.innerHTML = '<p>게시글이 없습니다.</p>';
        return;
    }

    postList.innerHTML = posts.map((post) => {
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
}

fetchPosts();