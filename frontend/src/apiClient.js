const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('jwtToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  const isAuthRequest = endpoint.toLowerCase().includes('/api/auth/');

  if (response.status === 401 && !isAuthRequest) {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('currentUser');
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/') {
      window.location.href = '/login';
    }
  }

  return response;
};

export default apiClient;
