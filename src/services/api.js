import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5001/api',
});

// Add token to requests if it exists
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authAPI = {
    register: (data) => API.post('/auth/register', data),
    login: (data) => API.post('/auth/login', data),
};

// Projects API
export const projectsAPI = {
    getAll: () => API.get('/projects'),
    getById: (id) => API.get(`/projects/${id}`),
    create: (data) => API.post('/projects', data),
    update: (id, data) => API.put(`/projects/${id}`, data),
    delete: (id) => API.delete(`/projects/${id}`),
};

// Tasks API
export const tasksAPI = {
    getByProject: (projectId) => API.get(`/tasks/project/${projectId}`),
    create: (data) => API.post('/tasks', data),
    update: (id, data) => API.put(`/tasks/${id}`, data),
    delete: (id) => API.delete(`/tasks/${id}`),
};

// Files API
export const filesAPI = {
    getByProject: (projectId) => API.get(`/files/project/${projectId}`),
    upload: (data) => API.post('/files', data),
    delete: (id) => API.delete(`/files/${id}`),
};

// Discussions API
export const discussionsAPI = {
    getByProject: (projectId) => API.get(`/discussions/project/${projectId}`),
    create: (data) => API.post('/discussions', data),
    addReply: (id, data) => API.post(`/discussions/${id}/reply`, data),
    delete: (id) => API.delete(`/discussions/${id}`),
};

export default API;
