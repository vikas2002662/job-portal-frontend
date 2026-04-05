import axios from "axios";

const API = axios.create({
  baseURL: "https://job-portal-backend-2-ictb.onrender.com",
});

// ✅ REQUEST INTERCEPTOR (FIXED)
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");

    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR (optional but useful)
API.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log("API ERROR:", err.response?.status);
    return Promise.reject(err);
  }
);

export default API;