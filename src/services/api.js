import axios from 'axios';

const API = axios.create({
    baseURL: '/api',
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
    addMember: (id, identifier) => API.post(`/projects/${id}/members`, { identifier }),
    removeMember: (id, userId) => API.delete(`/projects/${id}/members/${userId}`),
    complete: (projectId) => API.patch(`/projects/${projectId}/complete`),
    getCompleted: () => API.get('/projects?status=completed'), // optional, see below
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
    getChat: (projectId, userId, currentUserId) => API.get(`/discussions/chat/${projectId}/${userId}?currentUserId=${currentUserId}`),
    getUnreadCounts: (projectId, userId) => API.get(`/discussions/unread/${projectId}/${userId}`),
    create: (data) => API.post('/discussions', data),
    addReply: (id, data) => API.post(`/discussions/${id}/reply`, data),
    delete: (id) => API.delete(`/discussions/${id}`),
};

// Announcements API
export const announcementsAPI = {
    getAll: () => API.get('/announcements'),
    create: (data) => API.post('/announcements', data),
    delete: (id) => API.delete(`/announcements/${id}`),
};

export default API;
