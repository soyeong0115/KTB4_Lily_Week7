import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { API_BASE_URL } from "../api/client";

export function useNotificationSocket() {
    const { isLoggedIn } = useAuth();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!isLoggedIn) {
            return;
        }

        const accessToken = localStorage.getItem('accessToken');
        const wsUrl = API_BASE_URL.replace(/^http/, 'ws');
        const ws = new WebSocket(`${wsUrl}/ws/alarm?token=${accessToken}`);

        ws.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            setNotifications((prev) => [notification, ...prev]);
        }

        ws.onopen = () => {
            console.log('알림 웹소켓 연결!');
        };

        ws.onclose = () => {
            console.log('알림 웹소켓 연결 종료!');
        };

        return () => {
            ws.close();
        };
    }, [isLoggedIn])


    return { notifications };
}