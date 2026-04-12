import React, { useCallback, useEffect, useState } from 'react';
import { adminPackageService, adminPartnerService } from '../services/adminApi';
import { uploadPackageImage } from '../services/uploadApi';
import AdminImageField from '../components/AdminImageField';
import { formatMoneyVnd } from '../utils/formatMoney';
import '../components/AdminLayout.css';
import './AdminFormShared.css';

const PACKAGE_TYPES = [
    { value: 'BREAKFAST', label: 'Bữa sáng' },
    { value: 'LUNCH', label: 'Bữa trưa' },
    { value: 'DINNER', label: 'Bữa tối' },
    { value: 'FULL_DAY', label: 'Cả ngày' },
    { value: 'WEEKLY', label: 'Theo tuần' },
    { value: 'MONTHLY', label: 'Theo tháng' }
];

const emptyPackageForm = () => ({
    partnerId: '',
    name: '',
    description: '',
    price: '',
    durationDays: '30',
    mealsPerDay: '2',
    packageType: 'MONTHLY',
    imageUrl: '',
    active: true
});

const packageToEditForm = (pkg) => ({
    partnerId: pkg.partnerId != null ? String(pkg.partnerId) : '',
    name: pkg.name ?? '',
    description: pkg.description ?? '',
    price: pkg.price != null ? String(pkg.price) : '',
    durationDays: pkg.durationDays != null ? String(pkg.durationDays) : '30',
    mealsPerDay: pkg.mealsPerDay != null ? String(pkg.mealsPerDay) : '2',
    packageType: pkg.packageType ?? 'MONTHLY',
    imageUrl: pkg.imageUrl ?? '',
    active: Boolean(pkg.active)
});

const AdminPackages = () => {
    const [partners, setPartners] = useState([]);
    const [packages, setPackages] = useState([]);
    const [form, setForm] = useState(emptyPackageForm);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(emptyPackageForm);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [success, setSuccess] = useState('');

    const load = useCallback(async () => {
        setError('');
        try {
            const [pRes, pkgRes] = await Promise.all([
                adminPartnerService.getAllPartners(),
                adminPackageService.getAllPackages()
            ]);
            setPartners(Array.isArray(pRes.data) ? pRes.data : []);
            setPackages(Array.isArray(pkgRes.data) ? pkgRes.data : []);
        } catch (err) {
            setError(err.response?.data?.message || 'Không tải được dữ liệu (cần quyền quản trị).');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const beginEdit = (pkg) => {
        setEditingId(pkg.id);
        setEditForm(packageToEditForm(pkg));
        setError('');
        setSuccess('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm(emptyPackageForm());
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (editingId == null) return;
        setError('');
        setSuccess('');
        const pid = editForm.partnerId === '' ? NaN : Number(editForm.partnerId);
        if (!Number.isFinite(pid)) {
            setError('Vui lòng chọn đối tác.');
            return;
        }
        const price = Number(String(editForm.price).replace(/\s/g, '').replace(',', '.'));
        const durationDays = parseInt(editForm.durationDays, 10);
        const mealsPerDay = parseInt(editForm.mealsPerDay, 10);
        if (!editForm.name.trim()) {
            setError('Nhập tên gói.');
            return;
        }
        if (!Number.isFinite(price) || price < 0) {
            setError('Giá không hợp lệ.');
            return;
        }
        if (!Number.isFinite(durationDays) || durationDays < 1) {
            setError('Số ngày phải ≥ 1.');
            return;
        }
        if (!Number.isFinite(mealsPerDay) || mealsPerDay < 1) {
            setError('Số suất/ngày phải ≥ 1.');
            return;
        }
        setEditSubmitting(true);
        try {
            await adminPackageService.updatePackage(editingId, {
                partnerId: pid,
                name: editForm.name.trim(),
                description: editForm.description.trim() || null,
                price,
                durationDays,
                mealsPerDay,
                packageType: editForm.packageType,
                imageUrl: editForm.imageUrl.trim() || null,
                active: editForm.active
            });
            setSuccess('Đã cập nhật gói combo.');
            cancelEdit();
            await load();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    (typeof err.response?.data === 'string' ? err.response.data : null) ||
                    'Không cập nhật được gói. Kiểm tra dữ liệu và quyền admin.'
            );
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const pid = form.partnerId === '' ? NaN : Number(form.partnerId);
        if (!Number.isFinite(pid)) {
            setError('Vui lòng chọn đối tác.');
            return;
        }
        const price = Number(String(form.price).replace(/\s/g, '').replace(',', '.'));
        const durationDays = parseInt(form.durationDays, 10);
        const mealsPerDay = parseInt(form.mealsPerDay, 10);
        if (!form.name.trim()) {
            setError('Nhập tên gói.');
            return;
        }
        if (!Number.isFinite(price) || price < 0) {
            setError('Giá không hợp lệ.');
            return;
        }
        if (!Number.isFinite(durationDays) || durationDays < 1) {
            setError('Số ngày phải ≥ 1.');
            return;
        }
        if (!Number.isFinite(mealsPerDay) || mealsPerDay < 1) {
            setError('Số suất/ngày phải ≥ 1.');
            return;
        }
        setSubmitting(true);
        try {
            await adminPackageService.createPackage({
                partnerId: pid,
                name: form.name.trim(),
                description: form.description.trim() || null,
                price,
                durationDays,
                mealsPerDay,
                packageType: form.packageType,
                imageUrl: form.imageUrl.trim() || null,
                active: form.active
            });
            setSuccess('Đã tạo gói combo mới.');
            setForm(emptyPackageForm());
            await load();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    (typeof err.response?.data === 'string' ? err.response.data : null) ||
                    'Không tạo được gói. Kiểm tra dữ liệu và quyền admin.'
            );
        } finally {
            setSubmitting(false);
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
            <h2 className="admin-page-title">Gói combo</h2>
            <p className="admin-page-desc">
                Tạo gói ăn gắn với đối tác. Khách chỉ thấy gói đang hoạt động trên trang mua hàng.
            </p>
            {error ? <div className="admin-error">{error}</div> : null}

            <div className="admin-panel admin-form-block" style={{ padding: '22px' }}>
                <h3>Thêm gói combo mới</h3>
                <p>Chọn đối tác đã có trong hệ thống (có thể tạo đối tác ở trang Đối tác trước).</p>
                <form onSubmit={handleSubmit}>
                    <div className="admin-form-grid">
                        <div className="admin-form-field">
                            <label htmlFor="pkg-partner">Đối tác *</label>
                            <select
                                id="pkg-partner"
                                name="partnerId"
                                value={form.partnerId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">— Chọn —</option>
                                {partners.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} (ID {p.id}
                                        {p.status ? '' : ', chưa duyệt'})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="admin-form-field">
                            <label htmlFor="pkg-name">Tên gói *</label>
                            <input
                                id="pkg-name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                placeholder="VD: Gói 30 ngày tiết kiệm"
                            />
                        </div>
                        <div className="admin-form-field">
                            <label htmlFor="pkg-price">Giá (VND) *</label>
                            <input
                                id="pkg-price"
                                name="price"
                                type="number"
                                min="0"
                                step="1000"
                                value={form.price}
                                onChange={handleChange}
                                required
                                placeholder="199000"
                            />
                        </div>
                        <div className="admin-form-field">
                            <label htmlFor="pkg-duration">Thời hạn (ngày) *</label>
                            <input
                                id="pkg-duration"
                                name="durationDays"
                                type="number"
                                min="1"
                                value={form.durationDays}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="admin-form-field">
                            <label htmlFor="pkg-meals">Suất ăn / ngày *</label>
                            <input
                                id="pkg-meals"
                                name="mealsPerDay"
                                type="number"
                                min="1"
                                value={form.mealsPerDay}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="admin-form-field">
                            <label htmlFor="pkg-type">Loại gói *</label>
                            <select
                                id="pkg-type"
                                name="packageType"
                                value={form.packageType}
                                onChange={handleChange}
                            >
                                {PACKAGE_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="admin-form-field admin-form-field-full">
                            <label htmlFor="pkg-desc">Mô tả</label>
                            <textarea
                                id="pkg-desc"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Nội dung hiển thị cho khách"
                            />
                        </div>
                        <AdminImageField
                            inputId="pkg-img"
                            label="Ảnh gói (URL hoặc upload)"
                            value={form.imageUrl}
                            onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
                            uploadFn={uploadPackageImage}
                        />
                        <div className="admin-form-field">
                            <label
                                htmlFor="pkg-active"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                    cursor: 'pointer'
                                }}
                            >
                                <input
                                    id="pkg-active"
                                    type="checkbox"
                                    name="active"
                                    checked={form.active}
                                    onChange={handleChange}
                                />
                                <span>Gói đang hoạt động (hiện trên trang khách)</span>
                            </label>
                        </div>
                    </div>
                    <div className="admin-form-actions">
                        <button type="submit" className="admin-btn-primary" disabled={submitting}>
                            {submitting ? 'Đang tạo…' : 'Tạo gói'}
                        </button>
                    </div>
                    {success ? <div className="admin-form-success">{success}</div> : null}
                </form>
            </div>

            {editingId != null ? (
                <div className="admin-panel admin-form-block" style={{ padding: '22px', marginTop: 24 }}>
                    <h3>Chỉnh sửa gói #{editingId}</h3>
                    <p>Cập nhật ảnh (upload hoặc URL) và thông tin gói. Ảnh hiển thị trên trang Gói của khách.</p>
                    <form onSubmit={handleEditSubmit}>
                        <div className="admin-form-grid">
                            <div className="admin-form-field">
                                <label htmlFor="edit-pkg-partner">Đối tác *</label>
                                <select
                                    id="edit-pkg-partner"
                                    name="partnerId"
                                    value={editForm.partnerId}
                                    onChange={handleEditChange}
                                    required
                                >
                                    <option value="">— Chọn —</option>
                                    {partners.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (ID {p.id}
                                            {p.status ? '' : ', chưa duyệt'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="admin-form-field">
                                <label htmlFor="edit-pkg-name">Tên gói *</label>
                                <input
                                    id="edit-pkg-name"
                                    name="name"
                                    value={editForm.name}
                                    onChange={handleEditChange}
                                    required
                                />
                            </div>
                            <div className="admin-form-field">
                                <label htmlFor="edit-pkg-price">Giá (VND) *</label>
                                <input
                                    id="edit-pkg-price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={editForm.price}
                                    onChange={handleEditChange}
                                    required
                                />
                            </div>
                            <div className="admin-form-field">
                                <label htmlFor="edit-pkg-duration">Thời hạn (ngày) *</label>
                                <input
                                    id="edit-pkg-duration"
                                    name="durationDays"
                                    type="number"
                                    min="1"
                                    value={editForm.durationDays}
                                    onChange={handleEditChange}
                                    required
                                />
                            </div>
                            <div className="admin-form-field">
                                <label htmlFor="edit-pkg-meals">Suất ăn / ngày *</label>
                                <input
                                    id="edit-pkg-meals"
                                    name="mealsPerDay"
                                    type="number"
                                    min="1"
                                    value={editForm.mealsPerDay}
                                    onChange={handleEditChange}
                                    required
                                />
                            </div>
                            <div className="admin-form-field">
                                <label htmlFor="edit-pkg-type">Loại gói *</label>
                                <select
                                    id="edit-pkg-type"
                                    name="packageType"
                                    value={editForm.packageType}
                                    onChange={handleEditChange}
                                >
                                    {PACKAGE_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="admin-form-field admin-form-field-full">
                                <label htmlFor="edit-pkg-desc">Mô tả</label>
                                <textarea
                                    id="edit-pkg-desc"
                                    name="description"
                                    value={editForm.description}
                                    onChange={handleEditChange}
                                />
                            </div>
                            <AdminImageField
                                inputId="edit-pkg-img"
                                label="Ảnh gói (URL hoặc upload)"
                                value={editForm.imageUrl}
                                onChange={(url) => setEditForm((f) => ({ ...f, imageUrl: url }))}
                                uploadFn={uploadPackageImage}
                            />
                            <div className="admin-form-field">
                                <label
                                    htmlFor="edit-pkg-active"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 8,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <input
                                        id="edit-pkg-active"
                                        type="checkbox"
                                        name="active"
                                        checked={editForm.active}
                                        onChange={handleEditChange}
                                    />
                                    <span>Gói đang hoạt động (hiện trên trang khách)</span>
                                </label>
                            </div>
                        </div>
                        <div className="admin-form-actions">
                            <button type="submit" className="admin-btn-primary" disabled={editSubmitting}>
                                {editSubmitting ? 'Đang lưu…' : 'Lưu thay đổi'}
                            </button>
                            <button
                                type="button"
                                className="admin-btn-secondary"
                                onClick={cancelEdit}
                                disabled={editSubmitting}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}

            <div className="admin-panel" style={{ marginTop: 24, padding: 0, overflow: 'hidden' }}>
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Ảnh</th>
                                <th>Tên gói</th>
                                <th>Đối tác</th>
                                <th>Giá</th>
                                <th>Loại</th>
                                <th>Hoạt động</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packages.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--bb-muted)' }}>
                                        Chưa có gói combo.
                                    </td>
                                </tr>
                            ) : (
                                packages.map((pkg) => (
                                    <tr key={pkg.id}>
                                        <td style={{ width: 64, verticalAlign: 'middle' }}>
                                            {pkg.imageUrl ? (
                                                <img
                                                    src={pkg.imageUrl}
                                                    alt=""
                                                    style={{
                                                        width: 52,
                                                        height: 52,
                                                        objectFit: 'cover',
                                                        borderRadius: 10,
                                                        border: '1px solid var(--bb-border, #e5e7eb)'
                                                    }}
                                                />
                                            ) : (
                                                <span
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        color: 'var(--bb-muted)'
                                                    }}
                                                >
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <strong>{pkg.name}</strong>
                                            {pkg.description ? (
                                                <div
                                                    style={{
                                                        fontSize: '0.78rem',
                                                        color: 'var(--bb-muted)',
                                                        marginTop: 4,
                                                        maxWidth: 320
                                                    }}
                                                >
                                                    {pkg.description.length > 120
                                                        ? `${pkg.description.slice(0, 120)}…`
                                                        : pkg.description}
                                                </div>
                                            ) : null}
                                        </td>
                                        <td>{pkg.partnerName || `#${pkg.partnerId}`}</td>
                                        <td>{formatMoneyVnd(pkg.price)}</td>
                                        <td>{pkg.packageType}</td>
                                        <td>
                                            <span
                                                className={
                                                    'admin-badge ' +
                                                    (pkg.active ? 'admin-badge-on' : 'admin-badge-off')
                                                }
                                            >
                                                {pkg.active ? 'Bật' : 'Tắt'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="admin-btn-secondary"
                                                style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                                                onClick={() => beginEdit(pkg)}
                                            >
                                                Sửa
                                            </button>
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

export default AdminPackages;
