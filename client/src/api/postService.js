import { apiClient } from './apiClient';

export const postService = {
  getByUser: (userId) => apiClient.get(`/posts?userId=${userId}`),
  create: (post) => apiClient.post('/posts', post),
  update: (id, data) => apiClient.put(`/posts/${id}`, data),
  remove: (id) => apiClient.delete(`/posts/${id}`),
};
