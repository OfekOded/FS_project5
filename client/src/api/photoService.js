import { apiClient } from './apiClient';

export const photoService = {
  getByAlbumPage: (albumId, start, limit) =>
    apiClient.get(`/photos?albumId=${albumId}&_start=${start}&_limit=${limit}`),
  getByAlbumCount: async (albumId) => {
    const all = await apiClient.get(`/photos?albumId=${albumId}`);
    return all.length;
  },
  create: (photo) => apiClient.post('/photos', photo),
  update: (id, data) => apiClient.put(`/photos/${id}`, data),
  remove: (id) => apiClient.delete(`/photos/${id}`),
};
