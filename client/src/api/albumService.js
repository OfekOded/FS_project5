import { apiClient } from './apiClient';

export const albumService = {
  getByUser: (userId) => apiClient.get(`/albums?userId=${userId}`),
  getById: (id) => apiClient.get(`/albums/${id}`),
  create: (album) => apiClient.post('/albums', album),
  update: (id, data) => apiClient.put(`/albums/${id}`, data),
  remove: (id) => apiClient.delete(`/albums/${id}`),
};
