import { request } from './api.js';
import { renderComments } from './comment.js';

const postId = new URLSearchParams(window.location.search).get('postId');

const postEditButton = document.getElementById('post-edit-button');
const postDeleteButton = document.getElementById('post-delete-button');
const postLikeButton = document.getElementById('post-like-button');

const postTitle = document.querySelector('.detail-info h2');
const postContent = document.querySelector('.post-content');
const postAuthor = document.querySelector(".detail-author");
const postCreatedAt = document.querySelector(".detail-meta time");
const postStats = document.querySelectorAll(".stat-box strong");

const postLikeCount = postStats[0];
const postViewCount = postStats[1];
const postCommentCount = postStats[2];

let isLiked = false;

fetchPostDetail();

postEditButton.addEventListener("click", () => {
    window.location.href = `./post-edit.html?postId=${postId}`;
});

// 삭제 버튼 클릭시 확인 모달 -> 확인 -> 게시글 삭제
postDeleteButton.addEventListener("click", async () => {
    const confirmDelete = confirm("정말로 게시글을 삭제하시겠습니까?");

    if (!confirmDelete) {
        return;
    }

    try {
        await request(`/posts/${postId}`, { method: 'DELETE' });

        window.location.href = './posts.html';
    } catch (error) {
        alert('게시글 삭제에 실패했습니다.');
        console.error(error);
    }
});

export async function fetchPostDetail() {
    try {
        const post = await request(`/posts/${postId}`, { method: 'GET' });

        console.log('게시글 상세 조회 응답:', post);

        renderPostDetail(post);

    } catch (error) {
        alert('게시글 상세 조회에 실패했습니다.');
        console.error(error);
    }
}

function renderPostDetail(post) {
    postTitle.textContent = post.title;
    postAuthor.textContent = post.writer.nickname;
    postCreatedAt.textContent = post.createdAt;
    postContent.textContent = post.content;
    
    postLikeCount.textContent = post.likeCount;
    postViewCount.textContent = post.viewCount;
    postCommentCount.textContent = post.commentCount;

    isLiked = post.liked ?? false;

    if (isLiked) {
        postLikeButton.classList.add('is-liked');
    } else {
        postLikeButton.classList.remove('is-liked');
    }

    renderComments(post.comments ?? []);
}

postLikeButton.addEventListener("click", async () => {
    try {
        await request(`/posts/${postId}/likes`, {
            method: isLiked ? 'DELETE' : 'POST',
        });

        fetchPostDetail();
    } catch (error) {
        alert('좋아요 처리에 실패했습니다.');
        console.error(error);
    }
});