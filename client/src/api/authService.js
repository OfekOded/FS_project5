import { apiClient } from './apiClient';

export const authService = {
  async login(username, password) {
    const users = await apiClient.get(
      `/users?username=${encodeURIComponent(username)}`
    );
    if (!users || users.length === 0) return null;
    const user = users[0];
    if (user.website !== password) return null;
    return user;
  },

  async usernameExists(username) {
    const users = await apiClient.get(
      `/users?username=${encodeURIComponent(username)}`
    );
    return users && users.length > 0;
  },

  async register(newUser) {
    return apiClient.post('/users', newUser);
  },
};
