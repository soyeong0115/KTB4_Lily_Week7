import { useEffect, useState } from "react";
import { getNotifications } from "../api/notificationApi";
import Header from "../components/layout/Header";
import { useModal } from "../hooks/useModal";

export default function NotificationPage() {
    const [notifications, setNotifications] = useState([]);
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

    return (
        <>
            <Header backTo="/" />
            <main>

            </main>
        </>
    );
}