import { useEffect, useState } from "react";
import { getNotifications } from "../api/notificationApi";
import Header from "../components/layout/Header";
import { useModal } from "../hooks/useModal";
import NotificationList from "../components/notification/NotificationList";

export default function NotificationPage() {
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const { isAuthError, showAlertModal, showLoginRequiredModal } = useModal();

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const data = await getNotifications();
                setNotifications(data);
            } catch (error) {
                if (isAuthError(error)) {
                    await showLoginRequiredModal();
                    return;
                }

                await showAlertModal({ message: '알림을 불러오지 못했습니다.' })
                console.error(error);
            }
        }

        fetchNotifications();
    }, []);

    const visibleNotifications = activeTab === 'unread'
        ? notifications.filter((n) => !n.isRead)
        : notifications;

    return (
        <>
            <Header backTo="/" />
            <main>
                <button onClick={() => setActiveTab('all')}>전체</button>
                <button onClick={() => setActiveTab('unread')}>읽지 않음</button>

                <NotificationList notifications={visibleNotifications} />
            </main>
        </>
    );
}