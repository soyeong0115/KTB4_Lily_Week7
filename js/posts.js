const postList = document.querySelector('.post-list');

async function fetchPosts() {
    const accessToken = localStorage.getItem('accessToken');

    try {
        const response = await fetch('http://localhost:8080/posts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            postList.innerHTML = '<p>게시글을 불러오는데 실패했습니다.</p>';
            return;
        }

        renderPosts(data.data);
        console.log('게시글 목록 응답:', data);
        console.log('게시글 목록 데이터:', data.data);
    }
    catch (error) {
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