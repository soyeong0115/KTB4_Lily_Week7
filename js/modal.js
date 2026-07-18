function openModal(bodyHtml) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    backdrop.innerHTML = `<div class="modal">${bodyHtml}</div>`;

    document.body.appendChild(backdrop);

    return backdrop;
}

function closeModal(backdrop) {
    backdrop.remove();
}

export function showConfirmModal({ title, message, confirmText = '확인', cancelText = '취소' }) {
    return new Promise((resolve) => {
        const backdrop = openModal(`
            <span class="sidebar-tag tag-yellow modal-tag">! Notice</span>
            <h1>${title}</h1>
            <p>${message}</p>
            <div class="modal-buttons">
                <button type="button" class="cancel-button">${cancelText}</button>
                <button type="button" class="confirm-button">${confirmText}</button>
            </div>
        `);

        function finish(result) {
            closeModal(backdrop);
            resolve(result);
        }

        backdrop.querySelector('.cancel-button').addEventListener('click', () => finish(false));
        backdrop.querySelector('.confirm-button').addEventListener('click', () => finish(true));

        backdrop.addEventListener('click', (event) => {
            if (event.target === backdrop) {
                finish(false);
            }
        });
    });
}

export function showAlertModal({ title = '안내', message, confirmText = '확인' }) {
    return new Promise((resolve) => {
        const backdrop = openModal(`
            <span class="sidebar-tag tag-red modal-tag">⚠ Warning</span>
            <h1>${title}</h1>
            <p>${message}</p>
            <div class="modal-buttons">
                <button type="button" class="confirm-button">${confirmText}</button>
            </div>
        `);

        function finish() {
            closeModal(backdrop);
            resolve();
        }

        backdrop.querySelector('.confirm-button').addEventListener('click', finish);

        backdrop.addEventListener('click', (event) => {
            if (event.target === backdrop) {
                finish();
            }
        });
    });
}
