import { useEffect, useState } from "react";
import { deleteAllNotifications, getNotifications, markAllAsRead } from "../api/notificationApi";
import Header from "../components/layout/Header";
import { useModal } from "../hooks/useModal";
import NotificationList from "../components/notification/NotificationList";

export default function NotificationPage() {
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const { isAuthError, showAlertModal, showLoginRequiredModal, showConfirmModal } = useModal();

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

    async function handleMarkAllAsRead() {
        try {
            await markAllAsRead();
            fetchNotifications();
        } catch(error) {
            if (isAuthError(error)) {
                await showLoginRequiredModal();
                return;
            }

            await showAlertModal({ message: '모두 읽음 처리에 실패했습니다.'})
            console.error(error);
        }
    }

    async function handleDeleteAll() {
        const confirmDelete = await showConfirmModal({
            title: '모든 알림을 삭제하시겠습니까?',
            message: '삭제한 알림은 복구할 수 없습니다.'
        });

        if (!confirmDelete) {
            return;
        }

        try {
            await deleteAllNotifications();
            fetchNotifications();
        } catch(error) {
            if (isAuthError(error)) {
                await showLoginRequiredModal();
                return;
            }

            await showAlertModal({ message: '알림 삭제에 실패했습니다.'})
            console.error(error);
        }
    }

    useEffect(() => {
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

                <button onClick={handleMarkAllAsRead}>모두 읽음</button>
                <button onClick={handleDeleteAll}>모두 삭제</button>

                <NotificationList notifications={visibleNotifications} onChanged={fetchNotifications} />
            </main>
        </>
    );
}