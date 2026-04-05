import { useState } from "react";
import API from "../services/api";

function UploadResume() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("TOKEN:", localStorage.getItem("token"));

      await API.post("/resume/upload", formData);

      setSuccess(true);
      setFile(null);

    } catch (err) {
      console.log("UPLOAD ERROR:", err.response);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      <button onClick={handleUpload}>
        Upload Resume
      </button>

      {success && <p>Uploaded Successfully</p>}
    </div>
  );
}

export default UploadResume;