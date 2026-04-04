import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";

function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(data);
      if (!res.data.token || !res.data.role) {
        setError("Invalid response from server");
        return;
      }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      navigate(res.data.role === "EMPLOYER" ? "/dashboard" : "/jobs");
    } catch (err) {
      setError(err.response?.data || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen pt-16">

      {/* ── LEFT PANEL ── */}
      <div className="relative hidden md:flex flex-col justify-center px-16 bg-gradient-to-br from-[#0a1520] to-[#112035] overflow-hidden">
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_30%_60%,rgba(201,150,58,0.08),transparent)] pointer-events-none" />
        {/* Dot texture */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23C9963A' fill-opacity='0.15'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 max-w-sm">
          <span className="inline-block bg-[#C9963A]/10 border border-[#C9963A]/30 text-[#C9963A] text-xs tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
            Welcome Back
          </span>
          <h2 className="text-4xl font-bold text-white leading-snug mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Next <span className="text-[#C9963A]">Opportunity</span> Awaits
          </h2>
          <p className="text-[#7A8899] text-sm leading-relaxed mb-8 font-light">
            Join thousands of professionals who found their dream role through Portál.
          </p>
          <ul className="space-y-3">
            {["AI-matched job recommendations", "One-click resume applications", "Real-time application tracking", "Direct employer communication"].map((f) => (
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
            <span className="flex-1 text-center py-2.5 text-sm font-semibold bg-[#C9963A] text-[#0B1829]">
              Sign In
            </span>
            <Link to="/register" className="flex-1 text-center py-2.5 text-sm text-[#7A8899] hover:text-[#F7F4EE] transition-colors">
              Register
            </Link>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#7A8899] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                required
                className="w-full bg-[#0E1C2D] border border-[#1E2E42] text-[#F7F4EE] placeholder-[#3a4d62] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9963A] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#7A8899] mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                required
                className="w-full bg-[#0E1C2D] border border-[#1E2E42] text-[#F7F4EE] placeholder-[#3a4d62] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9963A] transition-colors"
              />
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
              {loading ? "Signing in…" : "Sign In to Account"}
            </button>
          </form>

          <p className="text-center text-[#7A8899] text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#C9963A] font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;