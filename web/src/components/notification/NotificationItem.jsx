import { useNavigate } from "react-router-dom";
import { markAsRead } from "../../api/notificationApi";
import { useModal } from "../../hooks/useModal";

export default function NotificationItem({ notification, onChanged }) {
    const navigate = useNavigate();
    const { isAuthError, showLoginRequiredModal, showAlertModal } = useModal();

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
        <div className="notification-item" onClick={handleClick}>
            <p>{notification.content}</p>
            <time>{notification.createdAt}</time>
        </div>
    );
}