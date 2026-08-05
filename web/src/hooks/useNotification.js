import { useContext } from "react";
import { NotificationContext } from "../contexts/NotificationContext";

export function useNotification() {
    const context = useContext(NotificationContext);
    return context;
}