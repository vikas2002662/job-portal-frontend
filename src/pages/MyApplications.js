import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await API.get("/applications/my-applications");
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ FIX: Employer contact ke saath /chat pe navigate karo
  const messageEmployer = (employer) => {
    navigate("/chat", {
      state: {
        openContact: {
          id: employer.id,
          name: employer.name,
          email: employer.email,
        },
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          My Applications
        </h2>
        <p className="text-[#7A8899] text-sm">Track the status of all your job applications</p>
      </div>

      {applications.length === 0 && (
        <div className="text-center py-20 bg-[#112033] border border-[#1E2E42] rounded-xl">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-white font-semibold mb-1">No applications yet</p>
          <p className="text-[#7A8899] text-sm">Start applying to jobs and track your progress here.</p>
        </div>
      )}

      <div className="space-y-3">
        {applications.map(app => (
          <div
            key={app.id}
            className="bg-[#112033] border border-[#1E2E42] rounded-xl px-6 py-5 flex flex-wrap justify-between items-center gap-4 hover:border-[#C9963A]/25 transition-colors"
          >
            <div>
              <h3 className="font-semibold text-white text-base mb-0.5">
                {app.job.title}
              </h3>
              <p className="text-[#7A8899] text-sm">📍 {app.job.location}</p>
              <p className="text-[#7A8899] text-xs mt-0.5">
                Employer: {app.job?.employer?.name || "—"}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">

              {/* ✅ FIX: Ab seedha us employer ki chat open hogi */}
              <button
                onClick={() => messageEmployer(app.job?.employer)}
                className="border border-[#1E88E5]/40 text-[#64B5F6] text-sm px-3 py-1.5 rounded-lg hover:bg-[#1E88E5]/10 transition-colors"
              >
                💬 Message
              </button>

              <span
                className={`px-3 py-1.5 rounded-lg border text-sm font-semibold
                  ${app.status === "HIRED"
                    ? "text-green-400 bg-green-900/20 border-green-700/30"
                    : app.status === "SHORTLISTED"
                    ? "text-yellow-400 bg-yellow-900/20 border-yellow-600/30"
                    : app.status === "REJECTED"
                    ? "text-red-400 bg-red-900/20 border-red-700/30"
                    : "text-[#7A8899] bg-[#1E2E42]/40 border-[#1E2E42]"
                  }`}
              >
                {app.status === "HIRED"       && "🎉 "}
                {app.status === "SHORTLISTED" && "⭐ "}
                {app.status === "REJECTED"    && "✕ "}
                {app.status === "PENDING"     && "🕐 "}
                {app.status}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default MyApplications;