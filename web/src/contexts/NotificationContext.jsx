import { createContext } from "react";
import { useNotificationSocket } from "../hooks/useNotificationSocket";

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const { notifications, refetch } = useNotificationSocket();

    return (
        <NotificationContext.Provider value={{ notifications, refetch }}>
            {children}
        </NotificationContext.Provider>
    );
}