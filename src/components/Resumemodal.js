import { useState } from "react";

function ResumeModal({ onConfirm, onClose }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(f.type)) { alert("Please upload a PDF or Word document."); return; }
    if (f.size > 5 * 1024 * 1024) { alert("File size must be under 5 MB."); return; }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleConfirm = async () => {
    if (!file) { alert("Please select a resume file."); return; }
    setLoading(true);
    try { await onConfirm(file); }
    finally { setLoading(false); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#132236] border border-[#1E2E42] rounded-2xl p-8 w-full max-w-md animate-fadeIn">

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              Upload Your Resume
            </h3>
            <p className="text-[#7A8899] text-sm leading-relaxed">
              Submit your resume with this application. PDF, DOC, DOCX — max 5 MB.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#7A8899] hover:text-[#F7F4EE] transition-colors text-lg ml-4 leading-none"
          >
            ✕
          </button>
        </div>

        {/* Drop Zone */}
        <div
          onClick={() => document.getElementById("modal-resume-input").click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all mb-6
            ${dragging ? "border-[#C9963A] bg-[#C9963A]/5" : "border-[#1E2E42] hover:border-[#C9963A] hover:bg-[#C9963A]/5"}
            ${file ? "border-[#1A8C5A] bg-[#1A8C5A]/5" : ""}
          `}
        >
          <span className="text-4xl block mb-3">{file ? "✅" : "📄"}</span>
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
              <p className="text-[#3a4d62] text-xs">PDF, DOC, DOCX up to 5 MB</p>
            </>
          )}
        </div>

        <input
          id="modal-resume-input"
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-[#1E2E42] text-[#7A8899] py-3 rounded-lg text-sm hover:border-[#F7F4EE] hover:text-[#F7F4EE] transition-all disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-[#C9963A] text-[#0B1829] font-semibold py-3 rounded-lg text-sm hover:bg-[#E8B55A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting…" : "Apply Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResumeModal;