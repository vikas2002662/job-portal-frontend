import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function Applicants() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState("");

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/applications/job/${id}`);
      setApps(res.data);
      if (res.data.length > 0) setJobTitle(res.data[0]?.job?.title || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewResume = (userId) => {
    window.open(`http://localhost:8081/resume/view/${userId}`, "_blank");
  };

  const updateStatus = async (appId, status) => {
    try {
      await API.put(`/applications/status/${appId}?status=${status}`);
      fetchApplicants();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  // ✅ FIX: Contact object ke saath /chat pe navigate karo
  // Chat.js mein useEffect lagega jo is contact ko auto-select karega
  const messageApplicant = (jobSeeker) => {
    navigate("/chat", {
      state: {
        openContact: {
          id: jobSeeker.id,
          name: jobSeeker.name,
          email: jobSeeker.email,
        },
      },
    });
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
    <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-[#7A8899] hover:text-white transition-colors text-sm"
        >
          ← Back
        </button>
        <div>
          <h2 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            Applicants {jobTitle && <span className="text-[#C9963A]">— {jobTitle}</span>}
          </h2>
          <p className="text-[#7A8899] text-sm">Review and manage applications for this job</p>
        </div>
      </div>

      {loading && <p className="text-[#7A8899] text-sm">Loading applicants…</p>}

      {!loading && apps.length === 0 && (
        <div className="text-center py-20 bg-[#112033] border border-[#1E2E42] rounded-xl">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-white font-semibold mb-1">No applications yet</p>
          <p className="text-[#7A8899] text-sm">No one has applied to this job yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {apps.map((app) => (
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
                {app.jobSeeker?.id && (
                  <button
                    onClick={() => viewResume(app.jobSeeker.id)}
                    className="inline-block mt-1 text-[#64B5F6] text-sm hover:underline"
                  >
                    📄 View Resume
                  </button>
                )}
              </div>

              <div className="flex gap-2 flex-wrap items-start">
                {/* ✅ FIX: Ab seedha us applicant ki chat open hogi */}
                <button
                  onClick={() => messageApplicant(app.jobSeeker)}
                  className="border border-[#1E88E5]/40 text-[#64B5F6] text-sm px-3 py-1.5 rounded-lg hover:bg-[#1E88E5]/10 transition-colors"
                >
                  💬 Message
                </button>
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

    </div>
  );
}

export default Applicants;