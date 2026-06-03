import axiosClient from './axiosClient';

export const getDocuments = async () => {
  const response = await axiosClient.get('/documents');
  return response.data;
};

export const getDocument = async (id) => {
  const response = await axiosClient.get(`/documents/${id}`);
  return response.data;
};

export const createDocument = async (title) => {
  const response = await axiosClient.post('/documents', { title });
  return response.data;
};

export const updateDocument = async (id, data) => {
  const response = await axiosClient.put(`/documents/${id}`, data);
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await axiosClient.delete(`/documents/${id}`);
  return response.data;
};

export const addCollaborator = async (id, email) => {
  const response = await axiosClient.post(`/documents/${id}/collaborators`, { email });
  return response.data;
};
