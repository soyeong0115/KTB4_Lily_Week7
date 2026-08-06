import NotificationItem from "./NotificationItem";

export default function NotificationList({ notifications, onChanged }) {
    if (notifications.length === 0) {
        return (
            <div className="notification-empty">
                <p>새로운 알림이 없어요.</p>
            </div>
        )
    }


    return (
        <section className="notification-list">
            {notifications.map((notification) => (
                <NotificationItem
                    notification={notification}
                    key={notification.notificationId}
                    onChanged={onChanged}
                />
            ))}
        </section>
    );
}