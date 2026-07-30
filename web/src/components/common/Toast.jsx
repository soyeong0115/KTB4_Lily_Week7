import { useEffect } from "react";

export default function Toast({ message, isShow, onHide }) {
    useEffect(() => {
        if (!isShow) return;

        const timerId = setTimeout(() => {
            onHide();
        }, 1500);

        return () => clearTimeout(timerId);
    }, [isShow, onHide]);

    return (
        <div className={`toast${isShow ? ' is-show' : ''}`}>
            <img className="toast-icon" src="/svg/check.svg" alt="" />
            {message}
        </div>
    );
}
