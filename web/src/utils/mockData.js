// 가상화 스크롤 적용 전/후 성능 비교용 임시 mock 데이터 (측정 끝나면 제거 예정)
// 0이면 비활성화, 1000 / 5000 / 10000으로 바꿔가며 측정
export const MOCK_COUNT = 1000;

export function generateMockNotifications(count) {
    return Array.from({ length: count }, (_, i) => ({
        notificationId: i,
        type: i % 2 === 0 ? 'LIKE' : 'COMMENT',
        content: `mock 알림 ${i}`,
        isRead: i % 3 === 0,
        postId: i,
        createdAt: new Date(Date.now() - i * 60000).toISOString(),
    }));
}

export function generateMockPosts(count) {
    return Array.from({ length: count }, (_, i) => ({
        postId: i,
        titlePreview: `mock 게시글 ${i}`,
        contentPreview: 'mock 본문 내용입니다.',
        postImage: null,
        likeCount: i % 50,
        commentCount: i % 20,
        viewCount: i * 3,
        createdAt: new Date(Date.now() - i * 60000).toISOString(),
        writer: {
            userId: i % 30,
            nickname: `user${i % 30}`,
            profileImage: null,
        },
    }));
}
