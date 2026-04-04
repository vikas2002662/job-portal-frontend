import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AddJob() {
  const [job, setJob] = useState({ title: "", description: "", location: "", salary: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/jobs", job);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data || "Failed to post job.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#0E1C2D] border border-[#1E2E42] text-[#F7F4EE] placeholder-[#3a4d62] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9963A] transition-colors";
  const labelClass = "block text-xs uppercase tracking-widest text-[#7A8899] mb-1.5";

  return (
    <div className="max-w-2xl mx-auto px-6 pt-24 pb-16">
      <div className="bg-[#112033] border border-[#1E2E42] rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          Post a New Job
        </h2>
        <p className="text-[#7A8899] text-sm mb-7">Fill in the details below to attract the right candidates</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Job Title</label>
            <input
              placeholder="e.g. Senior React Developer"
              value={job.title}
              onChange={(e) => setJob({ ...job, title: e.target.value })}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Job Description</label>
            <textarea
              placeholder="Describe the role, responsibilities, and requirements…"
              value={job.description}
              onChange={(e) => setJob({ ...job, description: e.target.value })}
              rows={4}
              className={inputClass + " resize-y leading-relaxed"}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Location</label>
              <input
                placeholder="e.g. Bengaluru"
                value={job.location}
                onChange={(e) => setJob({ ...job, location: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Monthly Salary (₹)</label>
              <input
                type="number"
                placeholder="e.g. 85000"
                value={job.salary}
                onChange={(e) => setJob({ ...job, salary: e.target.value })}
                required
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C9963A] text-[#0B1829] font-semibold py-3 rounded-lg hover:bg-[#E8B55A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Posting…" : "Post Job Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddJob;