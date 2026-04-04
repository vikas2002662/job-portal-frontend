import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import Dashboard from "./pages/Dashboard";
import AddJob from "./pages/AddJob";
import EditJob from "./pages/EditJob";
import UploadResume from "./pages/UploadResume";
import MyApplications from "./pages/MyApplications";
import Applicants from "./pages/Applicants";
import Chat from "./pages/Chat"; // ✅ ADD

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0B1829] text-[#F7F4EE] font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/jobs" element={
            <ProtectedRoute role="JOB_SEEKER"><Jobs /></ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute role="JOB_SEEKER"><UploadResume /></ProtectedRoute>
          } />
          <Route path="/my-applications" element={
            <ProtectedRoute role="JOB_SEEKER"><MyApplications /></ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute role="EMPLOYER"><Dashboard /></ProtectedRoute>
          } />
          <Route path="/add-job" element={
            <ProtectedRoute role="EMPLOYER"><AddJob /></ProtectedRoute>
          } />
          <Route path="/edit-job/:id" element={
            <ProtectedRoute role="EMPLOYER"><EditJob /></ProtectedRoute>
          } />
          <Route path="/applicants/:id" element={
            <ProtectedRoute role="EMPLOYER"><Applicants /></ProtectedRoute>
          } />

          {/* ✅ FIXED: Chat ab protected hai — bina login ke access nahi hoga */}
          <Route path="/chat" element={
            <ProtectedRoute><Chat /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;