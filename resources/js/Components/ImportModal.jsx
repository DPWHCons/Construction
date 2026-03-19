import React, { useState } from "react";
import axios from "axios";
import { showErrorMessage } from "@/Utils/alerts";

const ImportModal = ({ show, onClose, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const validTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  const validateFile = (f) => {
    if (!validTypes.includes(f.type)) {
      return "Please use a valid Excel file (.xlsx or .xls)";
    }
    if (f.size > 10 * 1024 * 1024) {
      return "File must be under 10MB";
    }
    return null;
  };

  const handleFile = (f) => {
    const err = validateFile(f);
    if (err) return setError(err);
    setFile(f);
    setError("");
  };

  const handleImport = async () => {
    if (!file) return setError("Select a file first");

    setImporting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("excel_file", file);

      const res = await axios.post(route("projects.import"), formData);

      if (res.data.success) {
        onImportSuccess(res.data);
        handleClose();
      } else {
        setError(res.data.message || "Import failed");
      }
    } catch (err) {
      showErrorMessage(
        "Import failed",
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError("");
    setImporting(false);
    onClose();
  };

  const formatFileSize = (bytes) => {
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-800">
            Import Projects
          </h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 mb-5">
          Upload an Excel file matching the export format.
        </p>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
          }}
          className={`rounded-xl p-6 text-center transition-all cursor-pointer
            ${dragOver
              ? "bg-slate-100"
              : "bg-slate-50 hover:bg-slate-100"}
          `}
        >
          {!file ? (
            <>
              <p className="text-sm text-slate-700 mb-2">
                Drag & drop your file
              </p>
              <p className="text-xs text-slate-400 mb-4">
                or click to browse (.xlsx, .xls)
              </p>

              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => handleFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />

              <label
                htmlFor="file-upload"
                className="inline-block text-sm font-medium text-[#Eb3505] hover:opacity-80 cursor-pointer"
              >
                Choose file
              </label>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-800">
                {file.name}
              </p>
              <p className="text-xs text-slate-400">
                {formatFileSize(file.size)}
              </p>
              <button
                onClick={() => setFile(null)}
                className="text-xs text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="mt-4 text-sm text-red-500">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={handleClose}
            disabled={importing}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-[#Eb3505] hover:opacity-90 transition disabled:opacity-50"
          >
            {importing ? "Importing..." : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;