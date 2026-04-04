import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getRole, logout, getToken } from "../utils/auth";

function Navbar() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const role       = getRole() || "";
  const token      = getToken() || "";
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!token) {
      setUnreadCount(0);
      return;
    }
    const read = () => {
      const val = parseInt(localStorage.getItem("unreadCount") || "0", 10);
      setUnreadCount(isNaN(val) ? 0 : val);
    };
    read();
    intervalRef.current = setInterval(read, 500);
    return () => clearInterval(intervalRef.current);
  }, [token]);

  useEffect(() => {
    if (location.pathname === "/chat") {
      localStorage.setItem("unreadCount", "0");
      setUnreadCount(0);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.setItem("unreadCount", "0");
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const MessagesNavLink = () => (
    <div className="relative inline-flex items-center">
      <Link
        to="/chat"
        className={`relative text-sm font-medium transition-colors duration-200 group
          ${isActive("/chat") ? "text-[#C9963A]" : "text-[#7A8899] hover:text-[#F7F4EE]"}`}
      >
        Messages
        <span className={`absolute -bottom-1 left-0 h-px bg-[#C9963A] transition-all duration-300
          ${isActive("/chat") ? "w-full" : "w-0 group-hover:w-full"}`} />
      </Link>
      {unreadCount > 0 && (
        <span className="ml-1.5 bg-[#C9963A] text-[#0B1829] text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight animate-pulse">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </div>
  );

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`relative text-sm font-medium transition-colors duration-200 group
        ${isActive(to) ? "text-[#C9963A]" : "text-[#7A8899] hover:text-[#F7F4EE]"}`}
    >
      {children}
      <span className={`absolute -bottom-1 left-0 h-px bg-[#C9963A] transition-all duration-300
        ${isActive(to) ? "w-full" : "w-0 group-hover:w-full"}`} />
    </Link>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&family=Baloo+2:wght@700;800&display=swap');
        .nav-font  { font-family: 'DM Sans', sans-serif; }
        .serif     { font-family: 'Playfair Display', serif; }
        .logo-font { font-family: 'Baloo 2', cursive; }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mobile-menu { animation: slideDown 0.2s ease forwards; }

        /* Logo shine sweep */
        @keyframes shine {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .logo-shine {
          background: linear-gradient(90deg, #C9963A 30%, #F5D07A 50%, #C9963A 70%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shine 3s linear infinite;
        }

        /* Tag pulse */
        @keyframes tagPop {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.08); }
        }
        .logo-tag { animation: tagPop 2.5s ease-in-out infinite; }
      `}</style>

      <nav className={`nav-font fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-10 transition-all duration-300
        ${scrolled
          ? "bg-[#0B1829]/95 backdrop-blur-xl border-b border-[#1E2E42] shadow-lg shadow-black/20"
          : "bg-[#0B1829]/80 backdrop-blur-md border-b border-[#1E2E42]/50"
        }`}
      >
        {/* ✅ NEW Logo — Job Dekho */}
        <div
          onClick={() => navigate(token ? (role === "EMPLOYER" ? "/dashboard" : "/jobs") : "/")}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          {/* Icon */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9963A] to-[#7A5010] flex items-center justify-center shadow-md group-hover:shadow-[#C9963A]/30 transition-shadow">
            <svg className="w-4 h-4 text-[#0B1829]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.53 15.86.5 13.5.5c-1.32 0-2.5.5-3.36 1.32L9 3 7.86 1.82C6.98 1.5 6.05 1.5 5.5 1.5 3.14 1.5 1 3.53 1 5.64 1 6.12 1.11 6.56 1.18 7H0v14h24V6h-4zm-6.5-4c1.38 0 2.5 1.01 2.5 2.14 0 .62-.31 1.19-.82 1.59L14 7h-2L9.32 5.73C8.81 5.33 8.5 4.76 8.5 4.14 8.5 3.01 9.62 2 11 2h2.5zM22 18H2V9h20v9z"/>
            </svg>
          </div>

          {/* Text */}
          <div className="flex items-baseline gap-0.5">
            <span className="logo-font text-xl font-extrabold logo-shine leading-none">
              Job
            </span>
            <span className="logo-font text-xl font-extrabold text-white leading-none">
              Dekho
            </span>
            {/* Small tag */}
            <span className="logo-tag ml-1 text-[8px] font-bold bg-[#C9963A]/20 text-[#C9963A] border border-[#C9963A]/30 px-1.5 py-0.5 rounded-full leading-tight hidden sm:inline">
              JOBS
            </span>
          </div>
        </div>

        {/* Desktop Nav — unchanged */}
        <div className="hidden md:flex items-center gap-7">
          {!token && (
            <>
              <NavLink to="/login">Sign In</NavLink>
              <Link
                to="/register"
                className="bg-[#C9963A] text-[#0B1829] text-sm font-semibold px-5 py-2 rounded-lg hover:bg-[#E8B55A] transition-colors shadow-md hover:shadow-[#C9963A]/20"
              >
                Get Started
              </Link>
            </>
          )}

          {token && role === "JOB_SEEKER" && (
            <>
              <NavLink to="/jobs">Browse Jobs</NavLink>
              <NavLink to="/upload">My Resume</NavLink>
              <NavLink to="/my-applications">Applications</NavLink>
              <MessagesNavLink />
            </>
          )}

          {token && role === "EMPLOYER" && (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/add-job">Post Job</NavLink>
              <MessagesNavLink />
            </>
          )}

          {token && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 border border-red-700/40 text-red-400 text-sm px-4 py-1.5 rounded-lg hover:bg-red-700/90 hover:text-white hover:border-red-600 transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          )}
        </div>

        {/* Mobile hamburger + badge */}
        <div className="md:hidden flex items-center gap-2">
          {token && unreadCount > 0 && (
            <span className="bg-[#C9963A] text-[#0B1829] text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-[#1E2E42] transition-colors"
          >
            <span className={`block w-5 h-0.5 bg-[#C9963A] transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-[#C9963A] transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-[#C9963A] transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu — unchanged */}
      {mobileOpen && (
        <div className="mobile-menu nav-font fixed top-16 left-0 right-0 z-40 bg-[#0E1F30] border-b border-[#1E2E42] shadow-2xl px-6 py-4 flex flex-col gap-3 md:hidden">
          {!token && (
            <>
              <Link to="/login" className="text-[#7A8899] text-sm py-2 hover:text-[#F7F4EE] transition-colors">Sign In</Link>
              <Link to="/register" className="bg-[#C9963A] text-[#0B1829] text-sm font-semibold px-4 py-2.5 rounded-lg text-center hover:bg-[#E8B55A] transition-colors">Get Started</Link>
            </>
          )}
          {token && role === "JOB_SEEKER" && (
            <>
              <Link to="/jobs"            className={`text-sm py-2 ${isActive("/jobs") ? "text-[#C9963A]" : "text-[#7A8899]"}`}>Browse Jobs</Link>
              <Link to="/upload"          className={`text-sm py-2 ${isActive("/upload") ? "text-[#C9963A]" : "text-[#7A8899]"}`}>My Resume</Link>
              <Link to="/my-applications" className={`text-sm py-2 ${isActive("/my-applications") ? "text-[#C9963A]" : "text-[#7A8899]"}`}>Applications</Link>
              <div className="flex items-center justify-between border-b border-[#1E2E42]/50 pb-1">
                <Link to="/chat" className={`text-sm py-2 ${isActive("/chat") ? "text-[#C9963A]" : "text-[#7A8899]"}`}>Messages</Link>
                {unreadCount > 0 && (
                  <span className="bg-[#C9963A] text-[#0B1829] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
            </>
          )}
          {token && role === "EMPLOYER" && (
            <>
              <Link to="/dashboard" className={`text-sm py-2 ${isActive("/dashboard") ? "text-[#C9963A]" : "text-[#7A8899]"}`}>Dashboard</Link>
              <Link to="/add-job"   className={`text-sm py-2 ${isActive("/add-job") ? "text-[#C9963A]" : "text-[#7A8899]"}`}>Post Job</Link>
              <div className="flex items-center justify-between border-b border-[#1E2E42]/50 pb-1">
                <Link to="/chat" className={`text-sm py-2 ${isActive("/chat") ? "text-[#C9963A]" : "text-[#7A8899]"}`}>Messages</Link>
                {unreadCount > 0 && (
                  <span className="bg-[#C9963A] text-[#0B1829] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
            </>
          )}
          {token && (
            <button onClick={handleLogout} className="text-left text-red-400 text-sm py-2 border-t border-[#1E2E42] mt-1 hover:text-red-300 transition-colors">
              Logout
            </button>
          )}
        </div>
      )}
    </>
  );
}

export default Navbar;