import { useState } from "react";
import API from "../services/api";

function UploadResume() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setSuccess(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await API.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
      setFile(null);
    } catch (err) {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 pt-24 pb-16">
      <div className="bg-[#112033] border border-[#1E2E42] rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          My Resume
        </h2>
        <p className="text-[#7A8899] text-sm mb-7 leading-relaxed">
          Upload your latest resume so employers can find you and you can apply with one click.
        </p>

        {/* Drop Zone */}
        <div
          onClick={() => document.getElementById("resume-page-input").click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl py-14 px-6 text-center cursor-pointer transition-all mb-5
            ${dragging ? "border-[#C9963A] bg-[#C9963A]/5" : "border-[#1E2E42] hover:border-[#C9963A] hover:bg-[#C9963A]/5"}
            ${file ? "border-[#1A8C5A] bg-[#1A8C5A]/5" : ""}
          `}
        >
          <span className="text-5xl block mb-4">{file ? "📄" : "☁️"}</span>
          {file ? (
            <>
              <p className="text-[#4CC98A] text-sm font-medium mb-1 break-all">{file.name}</p>
              <p className="text-[#3a4d62] text-xs">Click to change file</p>
            </>
          ) : (
            <>
              <p className="text-[#7A8899] text-sm mb-1">
                <span className="text-[#C9963A] font-semibold">Click to choose file</span> or drag & drop
              </p>
              <p className="text-[#3a4d62] text-xs">PDF, DOC, DOCX — max 5 MB</p>
            </>
          )}
        </div>

        <input
          id="resume-page-input"
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {success && (
          <div className="bg-[#1A8C5A]/10 border border-[#1A8C5A]/30 text-[#4CC98A] text-sm px-4 py-3 rounded-lg mb-4 font-medium">
            ✓ Resume uploaded successfully!
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-[#C9963A] text-[#0B1829] font-semibold py-3 rounded-lg hover:bg-[#E8B55A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading…" : "Upload Resume"}
        </button>
      </div>
    </div>
  );
}

export default UploadResume;