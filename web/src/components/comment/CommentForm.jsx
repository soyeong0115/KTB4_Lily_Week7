import { useEffect, useState } from "react";
import { createComment, updateComment } from "../../api/commentApi";
import { useModal } from "../../hooks/useModal";

export default function CommentForm({ postId, editingComment, onSuccess }) {
    const [ content, setContent ] = useState('');
    const { isAuthError, showAlertModal, showLoginRequiredModal } = useModal();
    
    useEffect(() => {
        setContent(editingComment ? editingComment.content : '');
    }, [editingComment]);

    async function handleSumbmit() {
        const isEditing = editingComment !== null;

        try {
            if (isEditing) {
                await updateComment(postId, editingComment.commentId, content);
            } else {
                await createComment(postId, content);
            }

            setContent('');
            onSuccess();

        } catch (error) {
            if (isAuthError(error)) {
                await showLoginRequiredModal();
                return;
            }

            await showAlertModal({ message: '댓글 등록에 실패했습니다' });
            console.error(error);
        }
    }

    return (
        <>
            <section className="comment-form">
                <span className="sidebar-tag tag-pink comment-form-tag">Comment</span>
                <textarea 
                    placeholder="댓글을 남겨주세요!"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                ></textarea>
                <div className="comment-form-bottom">
                    <button 
                        className="comment-submit" 
                        type="button"
                        onClick={handleSumbmit}
                        disabled={content.trim() === ''}
                    >
                        {editingComment !== null ? '댓글 수정' : '댓글 등록'}
                    </button>
                </div>
            </section>
        </>
    );
}
