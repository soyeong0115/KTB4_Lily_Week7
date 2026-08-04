import { API_BASE_URL } from '../../api/client.js';
import { deleteComment } from '../../api/commentApi.js';
import { useModal } from '../../hooks/useModal.js';
import { getAvatarColor } from '../../utils/avatarColor.js';

const COMMENT_COLORS = ['tag-yellow', 'tag-pink', 'tag-mint', 'tag-blue', 'tag-lilac'];

export default function CommentItem({ comment, postId, onEditRequest, onChanged }) {
    const { showConfirmModal, showAlertModal, showLoginRequiredModal, isAuthError } = useModal();

    const isMyComment = comment.myComment;
    const avatarColor = getAvatarColor(comment.writer.userId);
    const contentColor = COMMENT_COLORS[comment.commentId % COMMENT_COLORS.length];

    async function handleDelete() {
        const confirmDelete = await showConfirmModal({
            title: '댓글을 삭제하시겠습니까?',
            message: '삭제한 내용은 복구 할 수 없습니다.',
        });

        if (!confirmDelete) {
            return;
        }

        try {
            await deleteComment(postId, comment.commentId);

            onChanged();
        } catch (error) {
            if (isAuthError(error)) {
                await showLoginRequiredModal();
                return;
            }

            await showAlertModal({ message: '댓글 삭제에 실패했습니다.' });
            console.error(error);
        }
    }

    return (
        <article className="comment-item">
            <div className="comment-item-top">
                <span className="comment-avatar" style={{ '--avatar-color': avatarColor }}>
                    {comment.writer.profileImage
                        ? <img src={`${API_BASE_URL}${comment.writer.profileImage}`} alt="" />
                        : comment.writer.nickname.charAt(0)}
                </span>
                <div className="comment-info">
                    <strong>{comment.writer.nickname}</strong>
                    <time>{comment.createdAt}</time>
                </div>

                {isMyComment && (
                    <div className="small-button-group comment-button-group">
                        <button
                            className="small-button comment-edit-button"
                            type="button"
                            onClick={() => onEditRequest(comment)}
                        >
                            수정
                        </button>
                        <button
                            className="small-button comment-delete-button"
                            type="button"
                            onClick={handleDelete}
                        >
                            삭제
                        </button>
                    </div>
                )}
            </div>

            <p className={`comment-content ${contentColor}`}>{comment.content}</p>
        </article>
    );
}
