import { useEffect, useState } from "react";
import { getMyJobs, deleteJob } from "../services/jobService";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    const res = await getMyJobs();
    setJobs(res.data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this job listing?")) return;
    await deleteJob(id);
    fetchJobs();
  };

  // ✅ VIEW APPLICANTS
  const viewApplicants = async (jobId, jobTitle) => {
    try {
      setLoadingApplicants(true);
      const res = await API.get(`/applications/job/${jobId}`);
      setApplications(res.data);
      setSelectedJob(jobId);
      setSelectedJobTitle(jobTitle);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  // ✅ UPDATE STATUS
  const updateStatus = async (id, status) => {
    try {
      await API.put(`/applications/status/${id}?status=${status}`);
      viewApplicants(selectedJob, selectedJobTitle);
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  // ✅ VIEW RESUME — fixed: uses /resume/view/{userId} API instead of app.resumeUrl
  const viewResume = (userId) => {
    window.open(
      `https://job-portal-backend-2-ictb.onrender.com/resume/view/${userId}`,
      "_blank"
    );
  };

  const statusColor = (status) => {
    switch (status) {
      case "SHORTLISTED": return "text-yellow-400";
      case "HIRED":       return "text-green-400";
      case "REJECTED":    return "text-red-400";
      default:            return "text-[#7A8899]";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            Employer Dashboard
          </h2>
          <p className="text-[#7A8899] text-sm">Manage your job listings and track applications</p>
        </div>
        <button
          onClick={() => navigate("/add-job")}
          className="bg-[#C9963A] text-[#0B1829] font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-[#E8B55A] transition-colors"
        >
          + Post New Job
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Jobs",      value: jobs.length },
          { label: "Active Listings", value: jobs.length },
          { label: "Applications",    value: "—" },
        ].map((s) => (
          <div key={s.label} className="bg-[#112033] border border-[#1E2E42] rounded-xl p-5">
            <p className="text-[#7A8899] text-xs uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-[#C9963A] text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Job List */}
      {jobs.length === 0 ? (
        <div className="text-center py-16 text-[#7A8899]">
          No jobs posted yet.{" "}
          <button
            onClick={() => navigate("/add-job")}
            className="text-[#C9963A] hover:underline bg-transparent border-none cursor-pointer font-medium"
          >
            Post one now →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-[#112033] border border-[#1E2E42] rounded-xl px-6 py-4 flex flex-wrap justify-between items-center gap-4 hover:border-[#C9963A]/25 transition-colors"
            >
              <div>
                <p className="font-semibold text-white mb-0.5">{job.title}</p>
                <p className="text-[#7A8899] text-sm">
                  📍 {job.location} &nbsp;·&nbsp; ₹{Number(job.salary).toLocaleString("en-IN")}/mo
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => navigate(`/applicants/${job.id}`)}
                  className="border border-[#1E88E5]/40 text-[#64B5F6] text-sm px-4 py-1.5 rounded-lg hover:bg-[#1E88E5]/10 transition-colors"
                >
                  👥 Applicants
                </button>
                <button
                  onClick={() => navigate(`/edit-job/${job.id}`)}
                  className="border border-[#C9963A]/40 text-[#C9963A] text-sm px-4 py-1.5 rounded-lg hover:bg-[#C9963A]/10 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="border border-red-700/40 text-red-400 text-sm px-4 py-1.5 rounded-lg hover:bg-red-900/20 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Applicants Panel */}
      {selectedJob && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Applicants — <span className="text-[#C9963A]">{selectedJobTitle}</span>
            </h3>
            <button
              onClick={() => { setSelectedJob(null); setApplications([]); }}
              className="text-[#7A8899] text-sm hover:text-white transition-colors"
            >
              ✕ Close
            </button>
          </div>

          {loadingApplicants ? (
            <p className="text-[#7A8899] text-sm">Loading applicants…</p>
          ) : applications.length === 0 ? (
            <div className="bg-[#112033] border border-[#1E2E42] rounded-xl p-8 text-center text-[#7A8899]">
              No applications received yet for this job.
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-[#112033] border border-[#1E2E42] rounded-xl px-6 py-4 hover:border-[#C9963A]/25 transition-colors"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <p className="font-semibold text-white mb-0.5">{app.jobSeeker?.name || "N/A"}</p>
                      <p className="text-[#7A8899] text-sm mb-1">{app.jobSeeker?.email}</p>
                      <p className="text-sm">
                        Status:{" "}
                        <span className={`font-semibold ${statusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </p>
                      {/* ✅ FIXED: uses viewResume(userId) instead of app.resumeUrl */}
                      {app.jobSeeker?.id && (
                        <button
                          onClick={() => viewResume(app.jobSeeker.id)}
                          className="inline-block mt-1 text-[#64B5F6] text-sm hover:underline"
                        >
                          📄 View Resume
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => updateStatus(app.id, "SHORTLISTED")}
                        className="border border-yellow-600/40 text-yellow-400 text-sm px-3 py-1.5 rounded-lg hover:bg-yellow-900/20 transition-colors"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => updateStatus(app.id, "HIRED")}
                        className="border border-green-700/40 text-green-400 text-sm px-3 py-1.5 rounded-lg hover:bg-green-900/20 transition-colors"
                      >
                        Hire
                      </button>
                      <button
                        onClick={() => updateStatus(app.id, "REJECTED")}
                        className="border border-red-700/40 text-red-400 text-sm px-3 py-1.5 rounded-lg hover:bg-red-900/20 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default Dashboard;