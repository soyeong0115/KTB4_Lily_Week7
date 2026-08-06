export default function NotificationItem({ notification }) {
    return (
        <div className="notification-item">
            <p>{notification.content}</p>
            <time>{notification.createdAt}</time>
        </div>
    );
}