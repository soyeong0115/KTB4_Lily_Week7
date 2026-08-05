import { createContext } from "react";
import { useNotificationSocket } from "../hooks/useNotificationSocket";

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const { notifications } = useNotificationSocket();

    return (
        <NotificationContext.Provider value={{ notifications }}>
            {children}
        </NotificationContext.Provider>
    );
}