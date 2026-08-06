import { useNavigate } from "react-router-dom";
import { markAsRead } from "../../api/notificationApi";
import { formatRelativeTime } from "../../utils/formatRelativeTime.js";

const NOTIFICATION_ICONS = {
    LIKE: '/svg/heart.svg',
    COMMENT: '/svg/comment.svg',
};

export default function NotificationItem({ notification, onChanged }) {
    const navigate = useNavigate();

    async function handleClick() {
        try {
            await markAsRead(notification.notificationId);
            onChanged();
        } catch (error) {
            console.error(error);
        }

        navigate(`/posts/${notification.postId}`);
    }

    return (
        <div
            className={`notification-item${notification.isRead ? ' is-read' : ''}`}
            onClick={handleClick}
        >
            <span className="notification-item-icon">
                <img src={NOTIFICATION_ICONS[notification.type] ?? '/svg/heart.svg'} alt="" />
            </span>
            <p className="notification-item-content">{notification.content}</p>
            <time className="notification-item-time">{formatRelativeTime(notification.createdAt)}</time>
        </div>
    );
}
