import { apiClient } from './apiClient';

export const userService = {
  getById: (id) => apiClient.get(`/users/${id}`),
  getAll: () => apiClient.get('/users'),
};
