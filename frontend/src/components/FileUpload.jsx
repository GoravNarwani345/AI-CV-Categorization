import React, { useState } from "react";
import { FaCloudUploadAlt, FaFileAlt, FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first!");
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No token found. Please log in.");

      const formData = new FormData();
      formData.append('cv', file);

      // We'll use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      xhr.open('POST', `${API_URL}/cv/upload`, true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        const result = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && result.success) {
          setUploadedUrl(result.data.cvUrl);
          setMessage("CV uploaded and assigned successfully!");
          toast.success("CV uploaded successfully!");
          setFile(null);
          const input = document.getElementById('file-upload');
          if (input) input.value = '';

          if (onUploadSuccess) {
            onUploadSuccess(result.data);
          }

          setTimeout(() => setUploadProgress(0), 1500);
        } else {
          toast.error(result.error || "Upload failed");
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        toast.error("Network error occurred during upload.");
      };

      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      setMessage(`Error processing CV: ${error.message}`);
      toast.error(`Upload failed: ${error.message}`);
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg p-8 rounded-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Your CV</h2>
      <p className="text-gray-600 mb-6">Upload your real resume to our secure server for AI-powered processing.</p>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center hover:border-blue-400 transition-colors">
        <FaCloudUploadAlt size={60} className="text-blue-500 mb-4" />
        <p className="text-gray-700 font-medium mb-2">Drag & drop your CV here or click to browse</p>
        <p className="text-gray-500 text-sm mb-4">Supported formats: PDF, DOC, DOCX (Max 10MB)</p>

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          Choose File
        </label>
      </div>

      {file && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg flex items-center gap-3">
          <FaFileAlt className="text-blue-500" />
          <div className="flex-1">
            <p className="font-medium text-gray-800">{file.name}</p>
            <p className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          {isUploading && (
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className={`mt-6 w-full py-3 rounded-lg font-semibold transition ${!file || isUploading
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
      >
        {isUploading ? "Uploading..." : "Upload & Analyze"}
      </button>

      {message && (
        <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${message.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}>
          <FaCheckCircle />
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
