// src/components/DropzoneUpload.js
import React, { useRef, useState, useEffect } from 'react';

const DropzoneUpload = ({ file, onFileSelected, disabled }) => {
  const [isActive, setIsActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  // Build/cleanup preview URL
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const openFilePicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const onChange = (e) => {
    const f = e.target.files?.[0];
    if (f && f.type.startsWith('image/')) onFileSelected(f);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsActive(true);
  };

  const onDragLeave = () => setIsActive(false);

  const onDrop = (e) => {
    e.preventDefault();
    setIsActive(false);
    if (disabled) return;
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      alert('Please drop an image file.');
      return;
    }
    onFileSelected(f);
  };

  return (
    <div
      className={`dropzone ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={openFilePicker}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openFilePicker()}
      aria-label="Upload image by clicking or dragging and dropping"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onChange}
        hidden
        disabled={disabled}
      />

      {!preview ? (
        <div className="dropzone-empty">
          <div className="dz-icon">📤</div>
          <div className="dz-title">Drag & drop an image here</div>
          <div className="dz-sub">or click to browse</div>
          <div className="dz-hint">PNG • JPG • JPEG • WEBP</div>
        </div>
      ) : (
        <div className="dropzone-preview">
          <img src={preview} alt="preview" />
        </div>
      )}
    </div>
  );
};

export default DropzoneUpload;
