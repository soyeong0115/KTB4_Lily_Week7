export const API_BASE_URL = 'http://localhost:8080'

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
        const error = new Error(responseBody?.message || 'request_failed');
        error.status = response.status;
        error.body = responseBody;
        throw error;
    }

    return responseBody?.data ?? responseBody;
}