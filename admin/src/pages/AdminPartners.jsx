import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminPartnerService } from '../services/adminApi';
import { uploadPartnerImage } from '../services/uploadApi';
import AdminImageField from '../components/AdminImageField';
import '../components/AdminLayout.css';
import './AdminFormShared.css';
import './AdminPartners.css';

const emptyPartnerForm = () => ({
    name: '',
    address: '',
    description: '',
    phoneNumber: '',
    email: '',
    imageUrl: '',
    discountRate: ''
});

const AdminPartners = () => {
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [form, setForm] = useState(emptyPartnerForm);
    const [creating, setCreating] = useState(false);
    const [createSuccess, setCreateSuccess] = useState('');

    const load = async () => {
        setError('');
        try {
            const res = await adminPartnerService.getAllPartners();
            setRows(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setError(err.response?.data?.message || 'Không tải được đối tác (cần quyền quản trị).');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleCreatePartner = async (e) => {
        e.preventDefault();
        setError('');
        setCreateSuccess('');
        if (!form.name.trim() || !form.address.trim()) {
            setError('Tên và địa chỉ là bắt buộc.');
            return;
        }
        const discountRaw = String(form.discountRate).trim();
        const body = {
            name: form.name.trim(),
            address: form.address.trim(),
            description: form.description.trim() || null,
            phoneNumber: form.phoneNumber.trim() || null,
            email: form.email.trim() || null,
            imageUrl: form.imageUrl.trim() || null,
            discountRate: discountRaw === '' ? null : Number(discountRaw.replace(',', '.'))
        };
        if (body.discountRate != null && !Number.isFinite(body.discountRate)) {
            setError('Chiết khấu không hợp lệ.');
            return;
        }
        setCreating(true);
        try {
            await adminPartnerService.createPartner(body);
            setCreateSuccess('Đã tạo đối tác. Dùng nút Duyệt / Hiện để hiển thị cho khách.');
            setForm(emptyPartnerForm());
            await load();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    (typeof err.response?.data === 'string' ? err.response.data : null) ||
                    'Không tạo được đối tác.'
            );
        } finally {
            setCreating(false);
        }
    };

    const patchRow = (id, partial) => {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...partial } : r)));
    };

    const setActive = async (id, value) => {
        setBusyId(id);
        setError('');
        try {
            const res = await adminPartnerService.setPartnerActive(id, value);
            patchRow(id, res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Không cập nhật được trạng thái hiển thị.');
        } finally {
            setBusyId(null);
        }
    };

    const setStatus = async (id, value) => {
        setBusyId(id);
        setError('');
        try {
            const res = await adminPartnerService.setPartnerStatus(id, value);
            patchRow(id, res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Không cập nhật được phê duyệt.');
        } finally {
            setBusyId(null);
        }
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-spinner" />
            </div>
        );
    }

    return (
        <>
            <h2 className="admin-page-title">Đối tác</h2>
            <p className="admin-page-desc">
                Tạo nhà hàng mới, sau đó phê duyệt và bật hiển thị để khách thấy trên trang khách.
            </p>
            {error ? <div className="admin-error">{error}</div> : null}

            <div className="admin-panel admin-form-block" style={{ padding: '22px', marginBottom: 24 }}>
                <h3>Thêm đối tác mới</h3>
                <p>Mặc định: chưa duyệt, chưa hiển thị — dùng bảng bên dưới để bật.</p>
                <form onSubmit={handleCreatePartner}>
                    <div className="admin-form-grid">
                        <div className="admin-form-field">
                            <label htmlFor="pt-name">Tên *</label>
                            <input
                                id="pt-name"
                                name="name"
                                value={form.name}
                                onChange={handleFormChange}
                                required
                                placeholder="Tên quán / nhà hàng"
                            />
                        </div>
                        <div className="admin-form-field admin-form-field-full">
                            <label htmlFor="pt-address">Địa chỉ *</label>
                            <input
                                id="pt-address"
                                name="address"
                                value={form.address}
                                onChange={handleFormChange}
                                required
                                placeholder="Địa chỉ đầy đủ"
                            />
                        </div>
                        <div className="admin-form-field admin-form-field-full">
                            <label htmlFor="pt-desc">Mô tả</label>
                            <textarea
                                id="pt-desc"
                                name="description"
                                value={form.description}
                                onChange={handleFormChange}
                                placeholder="Giới thiệu ngắn"
                            />
                        </div>
                        <div className="admin-form-field">
                            <label htmlFor="pt-phone">Điện thoại</label>
                            <input
                                id="pt-phone"
                                name="phoneNumber"
                                value={form.phoneNumber}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="admin-form-field">
                            <label htmlFor="pt-email">Email</label>
                            <input
                                id="pt-email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="admin-form-field">
                            <label htmlFor="pt-discount">Chiết khấu (% hoặc hệ số)</label>
                            <input
                                id="pt-discount"
                                name="discountRate"
                                value={form.discountRate}
                                onChange={handleFormChange}
                                placeholder="VD: 10"
                            />
                        </div>
                        <AdminImageField
                            inputId="pt-img"
                            label="Ảnh đại diện (URL hoặc upload)"
                            value={form.imageUrl}
                            onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
                            uploadFn={uploadPartnerImage}
                        />
                    </div>
                    <div className="admin-form-actions">
                        <button type="submit" className="admin-btn-primary" disabled={creating}>
                            {creating ? 'Đang tạo…' : 'Tạo đối tác'}
                        </button>
                    </div>
                    {createSuccess ? <div className="admin-form-success">{createSuccess}</div> : null}
                </form>
            </div>

            <div className="admin-panel">
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Tên</th>
                                <th>Liên hệ</th>
                                <th>Hiển thị</th>
                                <th>Phê duyệt</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--bb-muted)' }}>
                                        Chưa có đối tác.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((p) => (
                                    <tr key={p.id}>
                                        <td className="admin-partner-cell">
                                            <Link
                                                className="admin-partner-name-link"
                                                to={`/partners/${p.id}/meals`}
                                                title="Chỉnh thực đơn theo tuần"
                                            >
                                                <strong>{p.name}</strong>
                                            </Link>
                                            {p.address ? <div className="admin-partner-address">{p.address}</div> : null}
                                            <div className="admin-partner-links-row">
                                                <Link
                                                    className="admin-partner-weekly-link"
                                                    to={`/partners/${p.id}/meals`}
                                                >
                                                    Thực đơn tuần →
                                                </Link>
                                                <Link
                                                    className="admin-partner-ratings-link"
                                                    to={`/partners/${p.id}/ratings`}
                                                >
                                                    Đánh giá khách →
                                                </Link>
                                            </div>
                                        </td>
                                        <td>
                                            {p.phoneNumber || '—'}
                                            {p.email ? (
                                                <div style={{ fontSize: '0.8rem', color: 'var(--bb-muted)' }}>
                                                    {p.email}
                                                </div>
                                            ) : null}
                                        </td>
                                        <td>
                                            <span
                                                className={
                                                    'admin-badge ' +
                                                    (p.active ? 'admin-badge-on' : 'admin-badge-off')
                                                }
                                            >
                                                {p.active ? 'Bật' : 'Tắt'}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={
                                                    'admin-badge ' +
                                                    (p.status ? 'admin-badge-on' : 'admin-badge-off')
                                                }
                                            >
                                                {p.status ? 'Đã duyệt' : 'Chờ'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                <button
                                                    type="button"
                                                    className="admin-btn-sm"
                                                    disabled={busyId === p.id}
                                                    onClick={() => setActive(p.id, !p.active)}
                                                >
                                                    {p.active ? 'Ẩn' : 'Hiện'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="admin-btn-sm"
                                                    disabled={busyId === p.id}
                                                    onClick={() => setStatus(p.id, !p.status)}
                                                >
                                                    {p.status ? 'Hủy duyệt' : 'Duyệt'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default AdminPartners;
