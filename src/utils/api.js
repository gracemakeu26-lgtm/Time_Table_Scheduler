import axios from 'axios';
import { saveToStorage, getFromStorage, removeFromStorage } from './storage';

// API Base URL - adjust this to match your backend URL
// In development, Vite proxy will forward /api requests to the backend
// In production, set VITE_API_BASE_URL environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getFromStorage('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - only redirect to login if we're on an admin page
      // Public pages (like /student) should handle 401 errors gracefully
      const currentPath = window.location.pathname;
      const isAdminPage =
        currentPath.startsWith('/admin') || currentPath === '/login';

      if (isAdminPage) {
        // Clear token and redirect to login only for admin pages
        removeFromStorage('auth_token');
        removeFromStorage('admin');
        window.location.href = '/login';
      }
      // For public pages, just let the error propagate so components can handle it
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      saveToStorage('auth_token', response.data.token);
      saveToStorage('admin', response.data.admin);
    }
    return response.data;
  },

  register: async (username, email, password, role = 'admin') => {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
      role,
    });
    if (response.data.token) {
      saveToStorage('auth_token', response.data.token);
      saveToStorage('admin', response.data.admin);
    }
    return response.data;
  },

  getCurrentAdmin: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: () => {
    removeFromStorage('auth_token');
    removeFromStorage('admin');
  },

  updateProfile: async (data) => {
    const response = await api.put('/auth/update-profile', data);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};

// Departments API
export const departmentsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/departments/', { params });
    // Backend returns { departments: [...] }, extract the array
    return response.data.departments || response.data.data || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/departments/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },

  getTeachers: async (id) => {
    const response = await api.get(`/departments/${id}/teachers`);
    return response.data;
  },

  getCourses: async (id) => {
    const response = await api.get(`/departments/${id}/courses`);
    return response.data;
  },
};

// Teachers API
export const teachersAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/teachers/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/teachers/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/teachers/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },

  getCourses: async (id) => {
    const response = await api.get(`/teachers/${id}/courses`);
    return response.data;
  },

  getSchedule: async (id) => {
    const response = await api.get(`/teachers/${id}/schedule`);
    return response.data;
  },
};

// Rooms API
export const roomsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/rooms/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/rooms/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/rooms/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },

  getSchedule: async (id, timetableId = null) => {
    const params = timetableId ? { timetable_id: timetableId } : {};
    const response = await api.get(`/rooms/${id}/schedule`, { params });
    return response.data;
  },

  checkAvailability: async (data) => {
    const response = await api.post('/rooms/availability', data);
    return response.data;
  },
};

// Courses API
export const coursesAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/courses/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/courses/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  assignTeacher: async (id, teacherId) => {
    const response = await api.put(`/courses/${id}/assign-teacher`, {
      teacher_id: teacherId,
    });
    return response.data;
  },

  unassignTeacher: async (id) => {
    const response = await api.put(`/courses/${id}/unassign-teacher`);
    return response.data;
  },
};

// Levels API
export const levelsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/levels/', { params });
    // Backend returns { levels: [...] }, extract the array
    return response.data.levels || response.data.data || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/levels/${id}`);
    return response.data;
  },

  getByCode: async (code) => {
    const response = await api.get(`/levels/by-code/${code}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/levels/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/levels/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/levels/${id}`);
    return response.data;
  },

  initialize: async () => {
    const response = await api.post('/levels/initialize');
    return response.data;
  },

  getCourses: async (id) => {
    const response = await api.get(`/levels/${id}/courses`);
    return response.data;
  },
};

// Timetables API
export const timetablesAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/timetables/', { params });
    // Backend returns { timetables: [...], count: ... }, extract the array
    return response.data.timetables || response.data.data || response.data;
  },

  getById: async (id, includeSlots = true) => {
    const response = await api.get(`/timetables/${id}`, {
      params: { include_slots: includeSlots },
    });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/timetables/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/timetables/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/timetables/${id}`);
    return response.data;
  },

  publish: async (id) => {
    const response = await api.put(`/timetables/${id}/publish`);
    return response.data;
  },

  archive: async (id) => {
    const response = await api.put(`/timetables/${id}/archive`);
    return response.data;
  },

  clone: async (id, data) => {
    const response = await api.post(`/timetables/${id}/clone`, data);
    return response.data;
  },

  getStats: async (id) => {
    const response = await api.get(`/timetables/${id}/stats`);
    return response.data;
  },
};

// Slots API
export const slotsAPI = {
  getAll: async (timetableId, params = {}) => {
    const response = await api.get(`/timetables/${timetableId}/slots/`, {
      params,
    });
    return response.data;
  },

  getById: async (timetableId, slotId) => {
    const response = await api.get(
      `/timetables/${timetableId}/slots/${slotId}`,
    );
    return response.data;
  },

  create: async (timetableId, data) => {
    const response = await api.post(`/timetables/${timetableId}/slots/`, data);
    return response.data;
  },

  bulkCreate: async (timetableId, slots) => {
    const response = await api.post(
      `/timetables/${timetableId}/slots/bulk-create`,
      { slots },
    );
    return response.data;
  },

  update: async (timetableId, slotId, data) => {
    const response = await api.put(
      `/timetables/${timetableId}/slots/${slotId}`,
      data,
    );
    return response.data;
  },

  delete: async (timetableId, slotId) => {
    const response = await api.delete(
      `/timetables/${timetableId}/slots/${slotId}`,
    );
    return response.data;
  },

  checkConflicts: async (timetableId, data) => {
    const response = await api.post(
      `/timetables/${timetableId}/slots/conflicts`,
      data,
    );
    return response.data;
  },
};

export default api;
