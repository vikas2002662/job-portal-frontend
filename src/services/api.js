import axios from "axios";

const API = axios.create({
  baseURL: "https://job-portal-backend-2-ictb.onrender.com"
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;