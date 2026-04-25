const apiBaseUrl = (import.meta.env.VITE_LANDING_API_BASE_URL || '').replace(/\/+$/, '');

export const buildApiUrl = (path) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${apiBaseUrl}${normalizedPath}`;
};

export const postJson = async (path, body) => {
    const response = await fetch(buildApiUrl(path), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
        ? await response.json()
        : {};

    if (!response.ok) {
        throw new Error(payload.error || 'Request failed. Please try again.');
    }

    return payload;
};
