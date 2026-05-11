import { apiClient } from './apiClient';

export const todoService = {
  getByUser: (userId) => apiClient.get(`/todos?userId=${userId}`),
  create: (todo) => apiClient.post('/todos', todo),
  update: (id, data) => apiClient.put(`/todos/${id}`, data),
  patch: (id, data) => apiClient.patch(`/todos/${id}`, data),
  remove: (id) => apiClient.delete(`/todos/${id}`),
};
