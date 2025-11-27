// frontend/src/components/ui/FileUpload.jsx
import React, { useRef } from 'react';
import { Upload, X, File } from 'lucide-react';
import Button from './Button';

const FileUpload = ({
  label,
  accept,
  multiple = false,
  maxSize = 10485760, // 10MB
  files = [],
  onChange,
  error,
  helperText,
  className = '',
}) => {
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate file size
    const validFiles = selectedFiles.filter((file) => {
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        return false;
      }
      return true;
    });

    if (multiple) {
      onChange([...files, ...validFiles]);
    } else {
      onChange(validFiles[0] || null);
    }
  };

  const removeFile = (index) => {
    if (multiple) {
      onChange(files.filter((_, i) => i !== index));
    } else {
      onChange(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const fileList = multiple ? files : files ? [files] : [];

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-indigo-500 hover:bg-gray-50'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
        
        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          Click to upload {multiple ? 'files' : 'a file'} or drag and drop
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {accept ? `Accepted: ${accept}` : 'Any file type'} (Max {maxSize / 1024 / 1024}MB)
        </p>
      </div>

      {fileList.length > 0 && (
        <div className="mt-4 space-y-2">
          {fileList.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <File className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="text-gray-400 hover:text-red-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default FileUpload;
