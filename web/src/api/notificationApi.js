import { request } from "./client";

// 알림 전체 조회
export function getNotifications() {
    return request('/notifications', { method: 'GET' });
}

// 알림 읽음 처리
export function markAsRead(notificationId) {
    return request(`/notifications/${notificationId}/read`, { method: 'PATCH' });
}

// 알림 모두 읽음 처리
export function markAllAsRead() {
    return request('/notifications/read-all', { method: 'PATCH' });
}

// 알림 모두 삭제
export function deleteAllNotifications() {
    return request('/notifications', { method: 'DELETE' });
}