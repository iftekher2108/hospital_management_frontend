export const Fetch = (endpoint, options = {}) => {
  const baseUrl = "http://localhost:3002";
  return fetch(`${baseUrl}${endpoint}`, options);
};