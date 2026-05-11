import { apiClient } from './apiClient';

export const commentService = {
  getByPost: (postId) => apiClient.get(`/comments?postId=${postId}`),
  create: (comment) => apiClient.post('/comments', comment),
  update: (id, data) => apiClient.put(`/comments/${id}`, data),
  remove: (id) => apiClient.delete(`/comments/${id}`),
};
