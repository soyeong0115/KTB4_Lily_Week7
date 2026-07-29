import CommentItem from './CommentItem.jsx';

export default function CommentList({ comments, postId, onEditRequest, onChanged }) {
    if (comments.length === 0) {
        return (
            <div className="comment-empty">
                <img className="comment-empty-icon" src="/svg/sad.svg" alt="" />
                <p>아직 댓글이 없어요.<br />가장 먼저 이야기를 남겨보세요!</p>
            </div>
        );
    }

    return (
        <section className="comment-list">
            {comments.map((comment) => (
                <CommentItem
                    comment={comment}
                    postId={postId}
                    onEditRequest={onEditRequest}
                    onChanged={onChanged}
                    key={comment.commentId}
                />
            ))}
        </section>
    );
}
