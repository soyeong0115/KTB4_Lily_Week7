export default function Modal({ modalState, onConfirm, onCancel }) {
    if (!modalState) {
        return null;
    }

    const { type, title, message, confirmText = '확인', cancelText = '취소' } = modalState;
    const isConfirm = type === 'confirm';

    return (
        <div
            className="modal-backdrop"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onCancel();
                }
            }}
        >
            <div className="modal">
                {isConfirm
                    ? <span className="sidebar-tag tag-yellow modal-tag">! Notice</span>
                    : <span className="sidebar-tag tag-red modal-tag">⚠ Warning</span>
                }
                <h1>{title}</h1>
                <p>{message}</p>
                <div className="modal-buttons">
                    {isConfirm && (
                        <button type="button" className="cancel-button" onClick={onCancel}>
                            {cancelText}
                        </button>
                    )}
                    <button type="button" className="confirm-button" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
