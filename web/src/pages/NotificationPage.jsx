import { useState } from "react";
import { deleteAllNotifications, markAllAsRead } from "../api/notificationApi";
import Header from "../components/layout/Header";
import SidebarTag from "../components/common/SidebarTag.jsx";
import { useModal } from "../hooks/useModal";
import { useNotification } from "../hooks/useNotification.js";
import NotificationList from "../components/notification/NotificationList";

export default function NotificationPage() {
    const [activeTab, setActiveTab] = useState('all');
    const { notifications, refetch } = useNotification();
    const { isAuthError, showAlertModal, showLoginRequiredModal, showConfirmModal } = useModal();

    async function handleMarkAllAsRead() {
        try {
            await markAllAsRead();
            refetch();
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
            refetch();
        } catch(error) {
            if (isAuthError(error)) {
                await showLoginRequiredModal();
                return;
            }

            await showAlertModal({ message: '알림 삭제에 실패했습니다.'})
            console.error(error);
        }
    }

    const visibleNotifications = activeTab === 'unread'
        ? notifications.filter((n) => !n.isRead)
        : notifications;

    return (
        <>
            <Header backTo="/" />
            <main className="notification-main">
                <div className="post-create-heading">
                    <SidebarTag color="tag-mint">✎ Notification</SidebarTag>
                    <h2 className="post-create-title">알림</h2>
                </div>

                <div className="notification-toolbar">
                    <div className="notification-tabs">
                        <button
                            className={`notification-tab${activeTab === 'all' ? ' is-active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            전체
                        </button>
                        <button
                            className={`notification-tab${activeTab === 'unread' ? ' is-active' : ''}`}
                            onClick={() => setActiveTab('unread')}
                        >
                            읽지 않음
                        </button>
                    </div>

                    <div className="notification-actions">
                        <button className="notification-action-link" onClick={handleMarkAllAsRead}>모두 읽음</button>
                        <button className="notification-action-link" onClick={handleDeleteAll}>모두 삭제</button>
                    </div>
                </div>

                <NotificationList notifications={visibleNotifications} onChanged={refetch} />
            </main>
        </>
    );
}
