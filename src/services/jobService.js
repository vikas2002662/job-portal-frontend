import API from "./api";

export const getJobs = () => API.get("/jobs");

export const searchJobs = (params) =>
  API.get("/jobs/search", { params });

export const applyJob = (id) =>
  API.post(`/applications/apply/${id}`);

// ✅ ADD THIS (IMPORTANT)
export const getMyJobs = () =>
  API.get("/jobs/my-jobs");

export const updateJob = (id, job) =>
  API.put(`/jobs/${id}`, job);

export const deleteJob = (id) =>
  API.delete(`/jobs/${id}`);

export const getApplicants = (jobId) =>
  API.get(`/applications/job/${jobId}`);

// ✅ NEW: View Resume
export const viewResume = (userId) =>
  API.get(`/resume/view/${userId}`, {
    responseType: "blob"
  });