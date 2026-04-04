import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import ResumeModal from "../components/Resumemodal";


function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ location: "", salary: "" });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingJobId, setPendingJobId] = useState(null);

  const fetchJobs = useCallback(async () => {
    const res = await API.get("/jobs/search", {
      params: {
        location: filters.location || null,
        salary: filters.salary || null,
        page,
        size: 5,
      },
    });
    setJobs(res.data.content);
    setTotalPages(res.data.totalPages);
  }, [filters, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleSearch = () => setPage(0);

  const handleApplyClick = (jobId) => {
    setPendingJobId(jobId);
    setModalOpen(true);
  };

  const handleConfirmApply = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      await API.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await API.post(`/applications/apply/${pendingJobId}`);
      setAppliedJobs((prev) => [...prev, pendingJobId]);
      setModalOpen(false);
      setPendingJobId(null);
    } catch (err) {
      alert(err.response?.data || "Application failed. Please try again.");
    }
  };

  const inputClass =
    "bg-[#0E1C2D] border border-[#1E2E42] text-[#F7F4EE] placeholder-[#3a4d62] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9963A] transition-colors";

  return (
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          Explore Opportunities
        </h2>
        <p className="text-[#7A8899] text-sm">Discover roles that match your skills and aspirations</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 bg-[#112033] border border-[#1E2E42] rounded-xl p-4 mb-6">
        <input
          placeholder="City or State"
          className={inputClass + " flex-1 min-w-[140px]"}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
        <input
          type="number"
          placeholder="Min Salary (₹)"
          className={inputClass + " flex-1 min-w-[140px]"}
          onChange={(e) => setFilters({ ...filters, salary: e.target.value })}
        />
        <button
          onClick={handleSearch}
          className="bg-[#C9963A] text-[#0B1829] font-semibold px-6 py-3 rounded-lg text-sm hover:bg-[#E8B55A] transition-colors whitespace-nowrap"
        >
          Search Jobs
        </button>
      </div>

      {/* Job Cards */}
      <div className="space-y-3">
        {jobs.length === 0 && (
          <div className="text-center py-16 text-[#7A8899]">No jobs found matching your criteria.</div>
        )}

        {jobs.map((job) => {
          const applied = appliedJobs.includes(job.id);
          return (
            <div
              key={job.id}
              className="bg-[#112033] border border-[#1E2E42] rounded-2xl p-6 hover:border-[#C9963A]/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-3 gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white mb-0.5">{job.title}</h3>
                  <p className="text-[#7A8899] text-xs">{job.company || "Company"}</p>
                </div>
                <span className="bg-[#1A8C5A]/15 border border-[#1A8C5A]/30 text-[#4CC98A] text-xs px-3 py-1 rounded-full whitespace-nowrap tracking-wide flex-shrink-0">
                  Hiring
                </span>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 mb-4">
                <span className="text-[#7A8899] text-sm">📍 {job.location}</span>
                <span className="text-[#C9963A] font-semibold text-sm">
                  ₹{Number(job.salary).toLocaleString("en-IN")}/mo
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  disabled={applied}
                  onClick={() => !applied && handleApplyClick(job.id)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all
                    ${applied
                      ? "bg-[#1A8C5A]/15 border border-[#1A8C5A]/30 text-[#4CC98A] cursor-default"
                      : "bg-[#C9963A] text-[#0B1829] hover:bg-[#E8B55A]"
                    }`}
                >
                  {applied ? "✓ Applied" : "Apply Now"}
                </button>
                <button className="px-4 py-2 rounded-lg text-sm border border-[#1E2E42] text-[#7A8899] hover:border-[#C9963A] hover:text-[#C9963A] transition-all">
                  Save
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 mt-10">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
          className="bg-[#112033] border border-[#1E2E42] text-[#7A8899] px-4 py-2 rounded-lg text-sm hover:border-[#C9963A] hover:text-[#C9963A] transition-all disabled:opacity-30 disabled:cursor-default"
        >
          ← Prev
        </button>
        <span className="text-[#7A8899] text-sm">Page {page + 1} of {totalPages}</span>
        <button
          disabled={page + 1 === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="bg-[#112033] border border-[#1E2E42] text-[#7A8899] px-4 py-2 rounded-lg text-sm hover:border-[#C9963A] hover:text-[#C9963A] transition-all disabled:opacity-30 disabled:cursor-default"
        >
          Next →
        </button>
      </div>

      {/* Resume Modal */}
      {modalOpen && (
        <ResumeModal
          onConfirm={handleConfirmApply}
          onClose={() => { setModalOpen(false); setPendingJobId(null); }}
        />
      )}
    </div>
  );
}

export default Jobs;