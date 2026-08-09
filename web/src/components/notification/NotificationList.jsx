import { useState } from "react";
import NotificationItem from "./NotificationItem";

const ITEM_HEIGHT = 73; // NotificationItem 한 개의 실제 측정 높이
const CONTAINER_HEIGHT = 600; // 리스트 스크롤 박스 높이
const OVERSCAN = 3;

export default function NotificationList({ notifications, onChanged }) {
    const [scrollTop, setScrollTop] = useState(0);

    if (notifications.length === 0) {
        return (
            <div className="notification-empty">
                <img className="notification-empty-icon" src="/svg/sad.svg" alt="" />
                <p>새로운 알림이 없어요.</p>
            </div>
        )
    }

    function handleOnScroll(nextScrollTop) {
        setScrollTop(nextScrollTop);
    }

    const rawStartIndex = Math.floor(scrollTop / ITEM_HEIGHT); // clamp 전 원본
    const startIndex = Math.max(0, rawStartIndex - OVERSCAN);   // 렌더링용
    const visibleCount = Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT);
    const endIndex = rawStartIndex + visibleCount + OVERSCAN;   // 원본 기준으로 계산
    const visibleNotifications = notifications.slice(startIndex, endIndex);

    return (
        <section
            className="notification-list"
            style={{ height: CONTAINER_HEIGHT, overflowY: 'auto' }}
            onScroll={(e) => handleOnScroll(e.target.scrollTop)}
        >
            <div style={{ height: notifications.length * ITEM_HEIGHT, position: 'relative' }}>
                {visibleNotifications.map((notification, i) => (
                    <div
                        key={notification.notificationId}
                        style={{ position: 'absolute', top: (startIndex + i) * ITEM_HEIGHT, left: 0, right: 0 }}
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