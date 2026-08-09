import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { API_BASE_URL } from "../api/client";
import { getNotifications } from "../api/notificationApi.js";
import { MOCK_COUNT, generateMockNotifications } from "../utils/mockData.js";

export function useNotificationSocket() {
    const { isLoggedIn } = useAuth();
    const [notifications, setNotifications] = useState([]);

    const refetch = useCallback(async () => {
        if (!isLoggedIn) {
            return;
        }

        if (MOCK_COUNT > 0) {
            setNotifications(generateMockNotifications(MOCK_COUNT));
            return;
        }

        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error(error);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (!isLoggedIn) {
            setNotifications([]);
            return;
        }

        refetch();

        if (MOCK_COUNT > 0) {
            return; // mock 측정 중엔 웹소켓 연결 스킵
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


    return { notifications, refetch };
}