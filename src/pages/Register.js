import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";

function Register() {
  const [user, setUser] = useState({ name: "", email: "", password: "", role: "JOB_SEEKER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(user);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#0E1C2D] border border-[#1E2E42] text-[#F7F4EE] placeholder-[#3a4d62] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9963A] transition-colors";
  const labelClass = "block text-xs uppercase tracking-widest text-[#7A8899] mb-1.5";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen pt-16">

      {/* ── LEFT PANEL ── */}
      <div className="relative hidden md:flex flex-col justify-center px-16 bg-gradient-to-br from-[#0a1520] to-[#112035] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_30%_60%,rgba(201,150,58,0.08),transparent)] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23C9963A' fill-opacity='0.15'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 max-w-sm">
          <span className="inline-block bg-[#C9963A]/10 border border-[#C9963A]/30 text-[#C9963A] text-xs tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
            Join Portál
          </span>
          <h2 className="text-4xl font-bold text-white leading-snug mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Start Your <span className="text-[#C9963A]">Journey</span> Today
          </h2>
          <p className="text-[#7A8899] text-sm leading-relaxed mb-8 font-light">
            Create your free account and connect with India's top employers or find the perfect candidate.
          </p>
          <ul className="space-y-3">
            {["Free for job seekers, always", "Verified employer profiles", "Resume builder & storage", "Instant application alerts"].map((f) => (
              <li key={f} className="flex items-center gap-3 text-[#7A8899] text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9963A] flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex flex-col justify-center px-8 md:px-16 bg-[#0B1829]">
        <div className="w-full max-w-sm mx-auto">

          {/* Tabs */}
          <div className="flex border border-[#1E2E42] rounded-lg overflow-hidden mb-8">
            <Link to="/login" className="flex-1 text-center py-2.5 text-sm text-[#7A8899] hover:text-[#F7F4EE] transition-colors">
              Sign In
            </Link>
            <span className="flex-1 text-center py-2.5 text-sm font-semibold bg-[#C9963A] text-[#0B1829]">
              Register
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                placeholder="Rahul Sharma"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                placeholder="Create a strong password"
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>I am a</label>
              <select
                value={user.role}
                onChange={(e) => setUser({ ...user, role: e.target.value })}
                className={inputClass + " cursor-pointer appearance-none"}
              >
                <option value="JOB_SEEKER">Job Seeker</option>
                <option value="EMPLOYER">Employer / Recruiter</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-700/30 text-red-400 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9963A] text-[#0B1829] font-semibold py-3 rounded-lg hover:bg-[#E8B55A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-[#7A8899] text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#C9963A] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;