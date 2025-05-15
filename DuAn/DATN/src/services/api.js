const API_URL = 'http://localhost:3000';

export const fetchUsers = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const fetchAdminData = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/users/admin`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};