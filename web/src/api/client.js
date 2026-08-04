export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export async function request(path, options = {}) {
    const accessToken = localStorage.getItem('accessToken');

    const headers = {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers, 
    };

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    let responseBody = null;

    try {
        responseBody = await response.json();
    } catch {
        responseBody = null;
    }

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }

        const error = new Error(responseBody?.message || 'request_failed');
        error.status = response.status;
        error.body = responseBody;
        throw error;
    }

    return responseBody?.data ?? responseBody;
}

// 이미지 업로드
export async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const data = await request('/images', {
        method: 'POST',
        body: formData,
    });

    return data.imageUrl;
}