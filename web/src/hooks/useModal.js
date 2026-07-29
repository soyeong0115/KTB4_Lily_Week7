import { useContext } from 'react';
import { ModalContext } from '../contexts/ModalContext';
import { useNavigate } from 'react-router-dom';

export function useModal() {
    const context = useContext(ModalContext);
    const navigate = useNavigate();

    async function showLoginRequiredModal() {
        const goToLogin = await context.showConfirm({
            title: '로그인이 필요합니다',
            message: '다시 로그인해주세요.',
            cancelText: '취소',
            confirmText: '로그인하러 가기',
        });

        if (goToLogin) {
            navigate('/login');
        }
    }

    function isAuthError(error) {
        if (error.status === 401) {
            return true;
        }

        return error.status === 403 && !error.body;
    }

    return {
        showConfirmModal: context.showConfirm,
        showAlertModal: context.showAlert,
        showLoginRequiredModal,
        isAuthError,
    };
}

