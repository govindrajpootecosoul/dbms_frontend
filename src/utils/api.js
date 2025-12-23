// Pick API base from env; fall back to current origin (works with Vite proxy) or live backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `${window.location.origin.replace(/\/$/, '')}/api` ||
  'https://dbms-backend-sand.vercel.app/api';

// Normalize once for consistent logging
const NORMALIZED_API_BASE = API_BASE_URL.replace(/\/$/, '');

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const url =
    endpoint.startsWith('/')
      ? `${NORMALIZED_API_BASE}${endpoint}`
      : `${NORMALIZED_API_BASE}/${endpoint}`;

  console.debug('API request start', { url, endpoint });

  try {
    const response = await fetch(url, config);
    
    // Check content-type before parsing
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    let data;
    if (isJson) {
      try {
        data = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, get text for debugging
        const text = await response.text();
        console.error('Failed to parse JSON response:', {
          url,
          status: response.status,
          contentType,
          bodyPreview: text.substring(0, 200)
        });
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }
    } else {
      // Non-JSON response (likely HTML error page)
      const text = await response.text();
      console.error('Non-JSON response received:', {
        url,
        status: response.status,
        contentType,
        bodyPreview: text.substring(0, 200)
      });
      
      // Try to extract error message from HTML or use status text
      let errorMessage = `Server returned ${response.status} ${response.statusText}`;
      if (text.includes('<title>')) {
        const titleMatch = text.match(/<title>(.*?)<\/title>/i);
        if (titleMatch) errorMessage = titleMatch[1];
      } else if (text.includes('<pre>')) {
        const preMatch = text.match(/<pre>(.*?)<\/pre>/i);
        if (preMatch) errorMessage = preMatch[1];
      }
      
      throw new Error(errorMessage);
    }

    if (!response.ok) {
      const message = data?.message || data?.error || `Request failed with ${response.status}`;
      console.error('API request failed', { url, status: response.status, message, data });
      throw new Error(message);
    }

    return data;
  } catch (error) {
    // If it's already our custom error, re-throw it
    if (error instanceof Error && error.message) {
      console.error('API Error:', { url, endpoint, message: error.message });
      throw error;
    }
    // Network or other errors
    console.error('API Error:', { url, endpoint, message: error.message, error });
    throw new Error(error.message || 'Network error - please check your connection');
  }
};

// Auth APIs
export const authAPI = {
  signup: (userData) => apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
};

// Anime APIs
export const animeAPI = {
  getAll: () => apiRequest('/anime'),
  
  getById: (id) => apiRequest(`/anime/${id}`),
  
  create: (animeData) => apiRequest('/anime', {
    method: 'POST',
    body: JSON.stringify(animeData),
  }),
  
  update: (id, animeData) => apiRequest(`/anime/${id}`, {
    method: 'PUT',
    body: JSON.stringify(animeData),
  }),
  
  delete: (id) => apiRequest(`/anime/${id}`, {
    method: 'DELETE',
  }),
};

// Genshin APIs
export const genshinAPI = {
  getAll: () => apiRequest('/genshin'),
  
  getById: (id) => apiRequest(`/genshin/${id}`),
  
  create: (characterData) => apiRequest('/genshin', {
    method: 'POST',
    body: JSON.stringify(characterData),
  }),
  
  update: (id, characterData) => apiRequest(`/genshin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(characterData),
  }),
  
  delete: (id) => apiRequest(`/genshin/${id}`, {
    method: 'DELETE',
  }),
};

// Game APIs
export const gameAPI = {
  getAll: () => apiRequest('/games'),
  
  getById: (id) => apiRequest(`/games/${id}`),
  
  create: (gameData) => apiRequest('/games', {
    method: 'POST',
    body: JSON.stringify(gameData),
  }),
  
  update: (id, gameData) => apiRequest(`/games/${id}`, {
    method: 'PUT',
    body: JSON.stringify(gameData),
  }),
  
  delete: (id) => apiRequest(`/games/${id}`, {
    method: 'DELETE',
  }),
};

// Credential APIs
export const credentialAPI = {
  getAll: () => apiRequest('/credentials'),
  
  getById: (id) => apiRequest(`/credentials/${id}`),
  
  create: (credentialData) => apiRequest('/credentials', {
    method: 'POST',
    body: JSON.stringify(credentialData),
  }),
  
  update: (id, credentialData) => apiRequest(`/credentials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(credentialData),
  }),
  
  delete: (id) => apiRequest(`/credentials/${id}`, {
    method: 'DELETE',
  }),
};

// KDrama APIs
export const kdramaAPI = {
  getAll: () => apiRequest('/kdrama'),
  
  getById: (id) => apiRequest(`/kdrama/${id}`),
  
  create: (dramaData) => apiRequest('/kdrama', {
    method: 'POST',
    body: JSON.stringify(dramaData),
  }),
  
  update: (id, dramaData) => apiRequest(`/kdrama/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dramaData),
  }),
  
  delete: (id) => apiRequest(`/kdrama/${id}`, {
    method: 'DELETE',
  }),
};

// Movie APIs
export const movieAPI = {
  getAll: () => apiRequest('/movies'),
  
  getById: (id) => apiRequest(`/movies/${id}`),
  
  create: (movieData) => apiRequest('/movies', {
    method: 'POST',
    body: JSON.stringify(movieData),
  }),
  
  update: (id, movieData) => apiRequest(`/movies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(movieData),
  }),
  
  delete: (id) => apiRequest(`/movies/${id}`, {
    method: 'DELETE',
  }),
};

