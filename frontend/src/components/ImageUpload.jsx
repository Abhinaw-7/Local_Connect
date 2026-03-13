import { useState, useRef } from 'react';
import { ImagePlus, X, Loader } from 'lucide-react';
import API from '../api';

const ImageUpload = ({ onUpload, multiple = false, label = 'Add Image' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState([]);
  const fileRef = useRef();

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      if (multiple && files.length > 1) {
        const formData = new FormData();
        files.forEach((f) => formData.append('images', f));
        const { data } = await API.post('/upload/multiple', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setPreview((prev) => [...prev, ...data.urls]);
        onUpload(data.urls);
      } else {
        const formData = new FormData();
        formData.append('image', files[0]);
        const { data } = await API.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setPreview((prev) => [...prev, data.url]);
        onUpload(multiple ? [data.url] : data.url);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Image upload failed. Make sure ImageKit keys are configured.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeImage = (idx) => {
    setPreview((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="image-upload">
      <input
        type="file"
        ref={fileRef}
        accept="image/*"
        multiple={multiple}
        onChange={handleFiles}
        hidden
      />
      <button
        type="button"
        className="btn btn-secondary btn-small upload-trigger"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <><Loader size={14} className="spin" /> Uploading...</>
        ) : (
          <><ImagePlus size={14} /> {label}</>
        )}
      </button>

      {preview.length > 0 && (
        <div className="image-previews">
          {preview.map((url, i) => (
            <div key={i} className="image-preview-item">
              <img src={url} alt={`Upload ${i + 1}`} />
              <button
                type="button"
                className="preview-remove"
                onClick={() => removeImage(i)}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
