import React, { useRef, useState } from 'react';
import { MAX_IMAGE_UPLOAD_BYTES } from '../services/uploadApi';
import './AdminImageField.css';

function extractMessage(err) {
    const d = err.response?.data;
    if (typeof d === 'string') return d;
    if (d?.message) return d.message;
    if (err.message === 'FILE_TOO_LARGE') {
        return `Ảnh tối đa ${Math.round(MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024))}MB.`;
    }
    return 'Upload thất bại. Kiểm tra Cloudinary trên server hoặc thử URL ảnh.';
}

/**
 * URL text field + file upload to Cloudinary via API.
 * @param {string} props.inputId
 * @param {string} props.label
 * @param {string} props.value
 * @param {(url: string) => void} props.onChange
 * @param {(file: File) => Promise<{ data?: { imageUrl?: string } }>} props.uploadFn
 */
const AdminImageField = ({ inputId, label, value, onChange, uploadFn }) => {
    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [hint, setHint] = useState('');

    const onFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setHint('Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, …).');
            return;
        }
        if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
            setHint(`Ảnh tối đa ${Math.round(MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024))}MB.`);
            return;
        }
        setHint('');
        setUploading(true);
        try {
            const res = await uploadFn(file);
            const url = res.data?.imageUrl;
            if (url) onChange(url);
            else setHint('Server không trả về URL ảnh.');
        } catch (err) {
            setHint(extractMessage(err));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="admin-form-field admin-form-field-full">
            <label htmlFor={inputId}>{label}</label>
            <div className="admin-image-field-row">
                <input
                    id={inputId}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="https://… hoặc upload file bên cạnh"
                />
                <div className="admin-image-field-actions">
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={onFile}
                    />
                    <button
                        type="button"
                        className="admin-btn-sm"
                        disabled={uploading}
                        onClick={() => fileRef.current?.click()}
                    >
                        {uploading ? 'Đang upload…' : 'Chọn ảnh'}
                    </button>
                </div>
            </div>
            <p className="admin-image-field-hint admin-image-field-hint--muted">
                Ảnh được gửi lên Cloudinary (cần cấu hình trên backend). Có thể dán URL thay cho upload.
            </p>
            {hint ? <div className="admin-image-field-hint">{hint}</div> : null}
            {value && /^https?:\/\//i.test(value) ? (
                <div className="admin-image-field-preview">
                    <img src={value} alt="" />
                </div>
            ) : null}
        </div>
    );
};

export default AdminImageField;
