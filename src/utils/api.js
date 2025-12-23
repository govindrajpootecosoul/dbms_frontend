// Force using deployed backend in all environments
const API_BASE_URL =
  'https://dbms-backend-gp3i8nx6s-govinds-projects-0e1f4b5e.vercel.app/api';

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

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
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

