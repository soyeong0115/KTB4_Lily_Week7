import NotificationItem from "./NotificationItem";

const ITEM_HEIGHT = 73; // NotificationItem 한 개의 실측 높이(px)
const CONTAINER_HEIGHT = 600; // 리스트 스크롤 박스 높이(px)

export default function NotificationList({ notifications, onChanged }) {
    if (notifications.length === 0) {
        return (
            <div className="notification-empty">
                <img className="notification-empty-icon" src="/svg/sad.svg" alt="" />
                <p>새로운 알림이 없어요.</p>
            </div>
        )
    }

    return (
        <section className="notification-list" style={{ height: CONTAINER_HEIGHT, overflowY: 'auto' }}>
            <div style={{ height: notifications.length * ITEM_HEIGHT, position: 'relative' }}>
                {notifications.map((notification, index) => (
                    <div
                        key={notification.notificationId}
                        style={{ position: 'absolute', top: index * ITEM_HEIGHT, left: 0, right: 0 }}
                    >
                        <NotificationItem
                            notification={notification}
                            onChanged={onChanged}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}