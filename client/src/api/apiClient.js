const BASE_URL = 'http://localhost:3001';

async function request(method, path, body) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(`${BASE_URL}${path}`, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} on ${method} ${path}`);
    }
    if (response.status === 204) return null;
    return await response.json();
  } catch (err) {
    console.error('API error:', err.message);
    throw err;
  }
}

export const apiClient = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
};
